from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2 import sql
import os
from datetime import datetime, timedelta

# connection_string = os.environ.get('CONNECTION_STRING')

app = Flask(__name__)
CORS(app)

def connect_db():
    try:
        connection = psycopg2.connect(
            host=os.environ.get('HOSTNAME'),
            port=os.environ.get('PORTNUMBER'),
            database=os.environ.get('DATABASE'),
            user=os.environ.get('USERNAME'),
            password=os.environ.get('PASSWORD')
        )
        print("Connected to the database successfully!")
        return connection
    except psycopg2.Error as e:
        print(f"Error connecting to the database: {e}")
        # Handle the error or re-raise it depending on your use case
        raise

@app.route('/api/data')
def get_data():
    connection = connect_db()

    # Create a cursor object
    cursor = connection.cursor()

    # Execute a query
    cursor.execute("SELECT * FROM \"User\"")

    # Fetch the results
    data = cursor.fetchall()

    # user_data = [
    #     {
    #         "UserID": record[0],
    #         "Password": record[1],
    #         "Birthday": record[2],
    #         "Bio": record[3],
    #         "ProfileImageUrl": record[4]
    #     }
    #     for record in data
    # ]

    # Close the cursor and connection
    cursor.close()
    connection.close()

    return jsonify(data)

@app.route('/api/createuser', methods=['POST'])
def create_user():
    try:
        
        # Extract data from the request
        data = request.json  # Assumes the data is sent as JSON in the request body
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        birthday = data.get('birthday')
        bio = data.get('bio')
        profile_image_url = data.get('profile_image_url')
        print(username, email, password, bio, birthday, profile_image_url)
        with connect_db() as connection:
            with connection.cursor() as cursor:
                # Use placeholders to prevent SQL injection
                cursor.execute("""
                    SELECT CreateUser(
                        %s, %s, %s, %s, %s, %s
                    ) AS new_user_id
                """, (username, email, password, birthday, bio, profile_image_url))

                # Fetch the result
                result = cursor.fetchone()[0]
                # Commit the transaction
                connection.commit()

        if result == -1:
            return jsonify({"error": "Could not create user, email or username is taken"})
        else:
            result_as_integer = int(result)
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT create_user_stats(
                            %s
                    )
                """, (result_as_integer,))

            # Commit the transaction
            connection.commit()
            return jsonify({"success": "Successfully created the new user"})

    except Exception as e:
        # Handle exceptions, log errors, or raise as needed
        print(f"Error: {e}")
        return jsonify({"error": "Unexpected error has occurred"})

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to login"})

    with connect_db() as connection:
        with connection.cursor() as cursor:
            # Use placeholders to prevent SQL injection
            cursor.execute("""
                SELECT user_login(
                    %s, %s
                ) AS result
            """, (username, password))

            # Fetch the result
            result = cursor.fetchone()[0]
            # Check if the result is an error message
            if result == -1:
                return jsonify({"error": 'Invalid username or password'})
            else:

                update_stats_result = update_stats(result)
                if update_stats_result:
                    return jsonify({"user_id": result})
                else:
                    return jsonify({"error": 'Failed to update user stats'})

def update_stats(user_id):
    # Check if the LastDayLoggedIn is the date before the current one
    with connect_db() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT LastDayLoggedIn, DaysInRow
                FROM Stats
                WHERE UserId = %s
            """, (user_id,))
            result = cursor.fetchone()

            if result:
                last_day_logged_in, days_in_row = result
                current_date = datetime.now().date()
                last_logged_in_date = datetime.strptime(str(last_day_logged_in), '%Y-%m-%d').date()

                if last_logged_in_date == current_date - timedelta(days=1):
                    # Update DaysInRow, DaysLoggedIn, Points, and update LastDayLoggedIn
                    cursor.execute("""
                        SELECT UpdateStats(
                            %s,
                            (SELECT DaysLoggedIn FROM Stats WHERE UserId = %s) + 1,
                            %s,
                            (SELECT Points FROM Stats WHERE UserId = %s) + 1,
                            '00:00:00'::INTERVAL
                        )
                    """, (user_id, user_id, days_in_row + 1, user_id))
                    return True
                else:
                    # Update DaysLoggedIn only
                    cursor.execute("""
                        SELECT UpdateStats(
                            %s,
                            (SELECT DaysLoggedIn FROM Stats WHERE UserId = %s) + 1,
                            1,
                            (SELECT Points FROM Stats WHERE UserId = %s) + 1,
                            '00:00:00'::INTERVAL
                        )
                    """, (user_id, user_id, user_id))
                    return True
            else:
                # Insert initial stats for the user
                cursor.execute("""
                    SELECT create_user_stats(
                               %s
                    )
                """, (user_id,))
                return True

@app.route('/api/userinfo', methods=['POST'])
def get_user_info():
    try:
        data = request.json
        user_id = data['user_id']
    except Exception as e:
        return jsonify({"error": "Failed to get user info"})

    with connect_db() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    UserName,
                    Bio,
                    Birthday,
                    ProfileImageUrl,
                    Email,
                    DaysLoggedIn,
                    DaysInRow,
                    Points,
                    TotalTime,
                    Sessions
                FROM GetUserInformation(%s)
                """,
                (user_id,)
            )

            result = cursor.fetchone()

    if result:
        # Convert the result into a JSON response
        user_info = {
            "UserName": result[0],
            "Bio": result[1],
            "Birthday": str(result[2]),  # Assuming Birthday is a DATE type
            "ProfileImageUrl": result[3],
            "Email": result[4],
            "DaysLoggedIn": result[5],
            "DaysInRow": result[6],
            "Points": result[7],
            "TotalTime": str(result[8]),  # Assuming TotalTime is an INTERVAL type
            "Sessions": result[9]
        }

        return jsonify(user_info)
    else:
        return jsonify({"error": "User not found or no information available"})
    
@app.route('/api/userthreads', methods=['POST'])
def get_user_threads():
    try:
        data = request.json
        user_id = data['user_id']
    except Exception as e:
        return jsonify({"error": "Failed to get user threads"})
    
    with connect_db() as connection:
        with connection as cursor:
            cursor.execute(
                """

                """
            )

@app.route('/api/usertimer', methods=['POST'])
def update_user_stats_time():
    try:
        data = request.json
        user_id = data['user_id']
    except Exception as e:
        return jsonify({"error": "Failed to get user threads"})
    
    with connect_db() as connection:
        with connection as cursor:
            cursor.execute(
                """

                """
            )        

if __name__ == '__main__':
    app.run(debug=True)
