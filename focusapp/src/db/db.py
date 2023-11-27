from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2 import sql
import ast
import os

# connection_string = os.environ.get('CONNECTION_STRING')

app = Flask(__name__)
CORS(app)

@app.route('/api/data')
def get_data():
    connection = psycopg2.connect(
        host=os.environ.get('HOSTNAME'),
        port=os.environ.get('PORTNUMBER'),
        database=os.environ.get('DATABASE'),
        user=os.environ.get('USERNAME'),
        password=os.environ.get('PASSWORD')
    )
    print("Connected to the database successfully!")

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
        with psycopg2.connect(
            host=os.environ.get('HOSTNAME'),
            port=os.environ.get('PORTNUMBER'),
            database=os.environ.get('DATABASE'),
            user=os.environ.get('USERNAME'),
            password=os.environ.get('PASSWORD')
        ) as connection:
            print("Connected to the database successfully!")
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

    with psycopg2.connect(
        host=os.environ.get('HOSTNAME'),
        port=os.environ.get('PORTNUMBER'),
        database=os.environ.get('DATABASE'),
        user=os.environ.get('USERNAME'),
        password=os.environ.get('PASSWORD')
    ) as connection:
        print("Connected to the database successfully!")
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

                # Directly return the user_id or an error message
                return jsonify({"user_id": result})
            
@app.route('/api/userinfo', methods=['POST'])
def getuserinfo():
    try: 
        data = request.json
        userid = data['user_id']
    except Exception as e:
        return jsonify({"error": "Failed to login"})
    
    with psycopg2.connect(
        host=os.environ.get('HOSTNAME'),
        port=os.environ.get('PORTNUMBER'),
        database=os.environ.get('DATABASE'),
        user=os.environ.get('USERNAME'),
        password=os.environ.get('PASSWORD')
    ) as connection:
        print("Connected to the database successfully!")
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT GetStatsByUserId(
                    %s
                )
                """
            , userid)

            data = cursor.fetchone()[0]
            
    
if __name__ == '__main__':
    app.run(debug=True)
