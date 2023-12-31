from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2 import sql
import os
from datetime import datetime, timedelta, time

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
        return jsonify({"error": "Unexpected error has occurred"}), 500

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
                    Sessions,
                    NumberOfLikes,
                    NumberOfFollowing,
                    NumberOfFollowers
                FROM GetUserInformation(%s)
                """,
                (user_id,)
            )

            result = cursor.fetchone()
    print('result', result)
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
            "Sessions": result[9],
            "TotalLikes": result[10],
            "Following": result[11],
            "Followers": result[12]
        }

        return jsonify(user_info)
    else:
        return jsonify({"error": "User not found or no information available"}), 500

@app.route('/api/postthread', methods=['POST'])
def post_user_thread():
    try:
        data = request.json
        user_id = data['user_Id']
        description = data['description']
        time_str = data['time']
    except Exception as e:
        return jsonify({"error": "Failed to post thread"})
    
    with connect_db() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                    SELECT CreatePost(
                        %s, %s
                    )  
                """,
                (user_id, description)
            )
            # Use fetchone() directly in the query
            result = cursor.fetchone()

            if result[0] != -1:
                # Convert the time to a timedelta object
                # Convert the time string to a timedelta object
                time_parts = [int(part) for part in time_str.split(':')]
                time_interval = timedelta(hours=time_parts[0], minutes=time_parts[1])

                # Call the UpdateTotalTime function to update TotalTime in the Stats table
                cursor.execute(
                    """
                        SELECT UpdateTotalTime(
                            %s, %s
                        )
                    """,
                    (user_id, time_interval)
                )

                # Commit the changes
                connection.commit()

                return jsonify({"success": "successfully posted thread"})
            else:
                return jsonify({"error": "Failed to post thread"}), 500


@app.route('/api/userthreads', methods=['POST'])
def get_user_threads():
    try:
        data = request.json
        user_id = data['user_id']
    except Exception as e:
        return jsonify({"error": "Failed to get user threads"})
    
    with connect_db() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    T.ThreadId,
                    T.ThreadText,
                    TO_CHAR(T.Date, 'YYYY-MM-DD') AS Date,
                    EXTRACT(HOUR FROM T.Time)::text || ':' || EXTRACT(MINUTE FROM T.Time)::text AS Time,
                    U.Username::text
                FROM
                    Thread T
                    JOIN "User" U ON T.UserId = U.UserId
                WHERE
                    T.UserId = %s
                """, 
                (user_id,))

            # Fetch the results
            results = cursor.fetchall()
            # Convert the results to a list of dictionaries
            columns = [desc[0] for desc in cursor.description]
            user_threads = [dict(zip(columns, row)) for row in results]

            # Convert the time objects to strings
            for thread in user_threads:
                thread['time'] = str(thread['time'])

            # Return the results as JSON
            return jsonify({"user_threads": user_threads})
        
@app.route('/api/deletethread', methods=['POST'])
def delete_thread():
    try:
        data = request.json
        thread_id = data['thread_id']
        
        with connect_db() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    BEGIN;
                    DELETE FROM Comment WHERE ThreadId = %s;
                    DELETE FROM LikesComment WHERE CommentId IN (SELECT CommentId FROM Comment WHERE ThreadId = %s);
                    DELETE FROM Thread WHERE ThreadId = %s;
                    COMMIT;
                """, (thread_id, thread_id, thread_id))

                return jsonify({"success": "Thread deleted successfully"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Unexpected error has occurred"}), 500
        

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

@app.route('/api/deleteuser', methods=['POST'])
def delete_user():
    try:
        data = request.json
        user_id = data.get('user_id')

        with connect_db() as connection:
            with connection.cursor() as cursor:
                # Execute the SQL code to delete the user and related data
                cursor.execute("""
                    BEGIN;
                    DELETE FROM Stats WHERE UserId = %s;
                    DELETE FROM Thread WHERE UserId = %s;
                    DELETE FROM Comment WHERE UserId = %s;
                    DELETE FROM LikesComment WHERE UserId = %s;
                    DELETE FROM Follows WHERE User1 = %s OR User2 = %s;
                    DELETE FROM "User" WHERE UserID = %s;
                    COMMIT;
                """, (user_id, user_id, user_id, user_id, user_id, user_id, user_id))

                # Check if any rows were affected, indicating successful deletion
                return jsonify({"success": "User deleted successfully"})

    except Exception as e:
        # Handle exceptions, log errors, or raise as needed
        print(f"Error: {e}")
        return jsonify({"error": "Unexpected error has occurred"}), 500


@app.route('/api/updatebio', methods=['POST'])
def update_bio():
    try:
        data = request.json
        user_id = data['user_id']
        new_bio = data['bio']

        with connect_db() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE "User"
                    SET Bio = %s
                    WHERE UserId = %s
                """, (new_bio, user_id))

                connection.commit()

        return jsonify({"success": "User bio updated successfully"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to update user bio"}), 500
    
@app.route('/api/editthread', methods=['POST'])
def update_thread():
    try:
        data = request.json
        thread_id = data['thread_id']
        new_thread = data['thread_text']

        with connect_db() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE Thread
                    SET threadText = %s
                    WHERE threadid = %s
                """, (new_thread, thread_id))

                connection.commit()

        return jsonify({"success": "Thread updated successfully"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to update thread"}), 500
    
@app.route('/api/explorethreads', methods=['POST'])
def explorethreads():
    try:
        data = request.json
        user_id = data['user_id']

        with connect_db() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT
                        T.ThreadId,
                        T.ThreadText,
                        T.UserId AS ThreadUserId,
                        U.UserName AS ThreadUserName,
                        TO_CHAR(T.Date, 'YYYY-MM-DD') AS Date,
                        EXTRACT(HOUR FROM T.Time)::text || ':' || EXTRACT(MINUTE FROM T.Time)::text AS Time,
                        CASE WHEN F.User2 IS NOT NULL THEN TRUE ELSE FALSE END AS Following,
                        CASE WHEN LT.UserId IS NOT NULL THEN TRUE ELSE FALSE END AS Liked
                    FROM
                        Thread T
                    LEFT JOIN
                        Follows F ON T.UserId = F.User2 AND F.User1 = %s
                    LEFT JOIN
                        LikesThread LT ON T.ThreadId = LT.ThreadId AND LT.UserId = %s
                    LEFT JOIN
                        "User" U ON T.UserId = U.UserId
                    WHERE
                        T.UserId != %s;
                """, (user_id, user_id, user_id))

                results = cursor.fetchall()

                columns = [desc[0] for desc in cursor.description]
                explore_threads = [dict(zip(columns, row)) for row in results]

                return jsonify({"explore_threads": explore_threads})

    except Exception as e:
        print("Failed to retrieve explore threads:", str(e))
        return jsonify({"error": "Failed to pull threads"})

@app.route('/api/likethread', methods=['POST'])
def likethread():
    try: 
        data = request.json
        user_id = data['user_id']
        thread_id = data['thread_id']

        with connect_db() as connection:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO LikesThread VALUES (%s, %s);", (user_id, thread_id))

            # Commit the transaction
            connection.commit()

            return jsonify({"Success" : "Liked thread successfully!"})
        
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to like the thread"}), 500

@app.route('/api/followuser', methods=['POST'])
def followuser():
    try: 
        data = request.json
        user_id1 = data['user_id1']
        user_id2 = data['user_id2']

        with connect_db() as connection:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO Follows VALUES (%s, %s);", (user_id1, user_id2))
            
            # Commit the transaction
            connection.commit()

            return jsonify({"Success": "Followed user successfully"})

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to follow the user"}), 500

@app.route('/api/unlikethread', methods=['POST'])
def unlikethread():
    try: 
        data = request.json
        user_id = data['user_id']
        thread_id = data['thread_id']

        with connect_db() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM LikesThread WHERE UserId = %s AND ThreadId = %s
                """, (user_id, thread_id))

            return jsonify({"Success" : "Unliked thread successfully!"})

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to unlike the thread"}), 500

@app.route('/api/unfollowuser', methods=['POST'])
def unfollowuser():
    try: 
        data = request.json
        user_id1 = data['user_id1']
        user_id2 = data['user_id2']

        with connect_db() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM Follows WHERE User1 = %s AND User2 = %s
                """, (user_id1, user_id2))

            return jsonify({"Success" : "Unfollowed user successfully"})

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to unfollow the user"}), 500

if __name__ == '__main__':
    app.run(debug=True)
