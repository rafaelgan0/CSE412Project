from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import os

connection_string = os.environ.get('CONNECTION_STRING')

app = Flask(__name__)
CORS(app, origins="*")

@app.route('/api/data')
def get_data():
    # Connect to your PostgreSQL database
    connection = psycopg2.connect(
        host=os.environ.get('HOST'),
        port=os.environ.get('PORT'),
        database=os.environ.get('DATABASE'),
        user=os.environ.get('USER'),
        password=os.environ.get('PASSWORD')
    )
    
    print("Connected to the database successfully!")

    # Create a cursor object
    cursor = connection.cursor()

    # Execute a query
    cursor.execute("SELECT * FROM \"User\"")

    # Fetch the results
    data = cursor.fetchall()

    user_data = [
        {
            "UserID": record[0],
            "Password": record[1],
            "Birthday": record[2],
            "Bio": record[3],
            "ProfileImageUrl": record[4]
        }
        for record in data
    ]

    # Close the cursor and connection
    cursor.close()
    connection.close()

    return jsonify(user_data)

if __name__ == '__main__':
    app.run(debug=True)
