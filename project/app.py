import datetime
import hashlib
import math

from flask import Flask
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
from flask import jsonify
from flask import request
from flask import abort
from flask_jwt_extended import (create_access_token, create_refresh_token, jwt_required, jwt_refresh_token_required,
                                get_jwt_identity, get_raw_jwt)
from flask_jwt_extended import JWTManager


def hash_password(password):
    """Hash a password for storing."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config['CORS_SUPPORTS_CREDENTIALS'] = 'True'

    app.config['MYSQL_USER'] = 'g20'
    app.config['MYSQL_PASSWORD'] = '4zobgxs8'
    app.config['MYSQL_HOST'] = 'localhost'
    app.config['MYSQL_DB'] = 'g20'
    app.config['MSQL_CURSORCLASS'] = 'DictCursor'
    app.config['JWT_SECRET_KEY'] = 'cisco'

    mysql = MySQL(app)
    jwt = JWTManager(app)

    @app.route('/signup', methods=['POST'])
    @cross_origin()
    def signup():
        fname = request.json.get('fname')
        lname = request.json.get('lname')
        email = request.json.get('email')
        password = request.json.get('password')
        password_repeat = request.json.get('password_repeat')

        # Check if passwords are the same
        if password != password_repeat:
            return "Passwords must be the same", 401

        # Check if any of the data is not missing
        if email is None or password is None or fname is None or lname is None:
            abort(401)  # Abort if missing data

        # Continue if data is OK...
        # Hash password
        pwdhash = hash_password(password)

        # If User exists database returns error becouse email field is unique

        # Open connection to database and add new user
        cur = mysql.connection.cursor()
        statement = f'''INSERT INTO users (fname, lname, password, email) 
                    VALUES ('{fname}', '{lname}', '{pwdhash}', '{email}')'''
        cur.execute(statement)
        mysql.connection.commit()

        return jsonify("User has been added!"), 204

    @app.route('/refresh', methods=['GET'])
    @cross_origin()
    @jwt_refresh_token_required
    def refresh():
        current_user = get_jwt_identity()
        response = {
            "access_token": create_access_token(identity=current_user)
        }
        return jsonify(response), 200

    @app.route('/signin', methods=['POST'])
    @cross_origin()
    def signin():
        email = request.json.get('email')
        password = request.json.get('password')

        # Get email address and hashed password from database
        cur = mysql.connection.cursor()
        statement = f''' SELECT email, password, id, is_admin FROM users WHERE email='{email}' '''
        cur.execute(statement)
        result = cur.fetchall()
        if len(result) == 0:
            return "Incorrect login or password", 401
        db_password = result[0][1]
        user_id = result[0][2]
        is_admin = result[0][3]

        # Check if user password and database password are the same
        if hash_password(password) == db_password:
            access_token = create_access_token(identity=email)
            refresh_token = create_refresh_token(identity=email)
            print(access_token)
            return {
                       'email': email,
                       'id': user_id,
                       'is_admin': is_admin,
                       'access_token': access_token,
                       'refresh_token': refresh_token
                   }, 200
        else:
            return 'Wrong credentials', 401

    @app.route('/get_books', methods=['GET'])
    @cross_origin()
    @jwt_required
    def get_books():
        statement = ''' SELECT book.id, COUNT(copy.id)/(SELECT COUNT(*) FROM books_has_categories 
                        WHERE books_id = book.id), book.title, book.year_release, author.fname, author.lname, pub.name, 
                        GROUP_CONCAT(DISTINCT(category.name) SEPARATOR ', ') FROM books book, authors author, 
                        publishers pub, book_copies copy, books_has_categories bhc, categories category
                        WHERE book.author_id = author.id AND copy.books_id = book.id AND copy.is_rental = 0
                        AND book.publisher_id = pub.id  AND bhc.books_id = book.id AND bhc.categories_id = category.id 
                        GROUP BY book.id ORDER BY book.title LIMIT 10'''
        cur = mysql.connection.cursor()
        cur.execute(statement)
        books = (cur.fetchall())
        statement = ''' SELECT CEILING(COUNT(DISTINCT(book.id))/10) FROM books book, book_copies copy 
                        WHERE copy.books_id = book.id AND copy.is_rental = 0'''
        cur = mysql.connection.cursor()
        cur.execute(statement)
        amount = cur.fetchall()
        result = amount + books

        return jsonify(result), 200

    @app.route('/get_books_filter', methods=['POST', 'GET'])
    @cross_origin()
    @jwt_required
    def get_books_filter():

        title = request.json.get('title')
        author_id = request.json.get('author_id')
        category_id = request.json.get('category_id')
        publisher_id = request.json.get('publisher_id')
        page = int(request.json.get('page'))

        if not author_id:
            author_id = 'ANY(SELECT author_id FROM books)'
        elif author_id:
            author_id = int(author_id)

        if not publisher_id:
            publisher_id = 'ANY(SELECT publisher_id FROM books)'
        elif publisher_id:
            publisher_id = int(publisher_id)

        statement_start = f'''SELECT book.id, COUNT(copy.id)/(SELECT COUNT(*) FROM books_has_categories 
                              WHERE books_id = book.id), book.title, book.year_release, author.fname, author.lname,
                              pub.name, GROUP_CONCAT(DISTINCT(category.name) SEPARATOR ', ') FROM books book, 
                              authors author, publishers pub, book_copies copy, books_has_categories bhc, 
                              categories category WHERE book.author_id = author.id AND copy.books_id = book.id 
                              AND copy.is_rental = 0 AND book.publisher_id = pub.id  AND bhc.books_id = book.id 
                              AND book.author_id = {author_id} AND book.publisher_id = {publisher_id}'''
        statement_end = f''' GROUP BY book.id ORDER BY book.id LIMIT 10 OFFSET {(page - 1) * 10}'''
        statement_end_pages = f''' GROUP BY book.id ORDER BY book.id'''

        if not title:
            if not category_id:
                statement_body = f''' AND bhc.categories_id = category.id'''
            elif category_id:
                category_id = int(category_id)
                statement_body = f''' AND bhc.categories_id = {category_id} AND category.id IN(SELECT categories_id 
                                FROM books_has_categories WHERE books_id = book.id)'''
        elif title:
            title = f''' '%{title.strip()}%' '''
            if not category_id:
                statement_body = f''' AND book.title LIKE {title} AND bhc.categories_id = category.id'''
            elif category_id:
                category_id = int(category_id)
                statement_body = f''' AND book.title LIKE {title} AND bhc.categories_id = {category_id} AND 
                                category.id IN(SELECT categories_id FROM books_has_categories WHERE books_id = book.id)                                
                                '''

        statement = statement_start + statement_body + statement_end
        statement_pages = statement_start + statement_body + statement_end_pages
        cur = mysql.connection.cursor()
        cur.execute(statement)
        filtered_books = cur.fetchall()
        cur.execute(statement_pages)
        pages = cur.fetchall()
        result = {'filtered_books': filtered_books, "pages": math.ceil(len(pages)/10)}

        return jsonify(result), 200

    @app.route('/rent_book', methods=['POST'])
    @cross_origin()
    @jwt_required
    def rent_book():
        user_id = request.json.get('user_id')
        pickup_date = request.json.get('pickup_date')
        book_id = request.json.get('book_id')
        date = pickup_date.split('-')
        delta = datetime.date(int(date[0]), int(date[1]), int(date[2])) - datetime.date.today()

        if delta.days < 0 or delta.days > 7:
            return "Wrong data"
        else:
            cur = mysql.connection.cursor()
            try:
                statement_get_book_copy = f'''SELECT id FROM book_copies b WHERE '{book_id}' = b.books_id AND is_rental = 0'''
                cur.execute(statement_get_book_copy)
                book_copy_id = cur.fetchall()[0][0]
                statement = f'''INSERT INTO orders (user_id, order_date, pickup_date, return_date, book_copies_id) 
                                SELECT '{user_id}', CURDATE(), '{pickup_date}', 
                                DATE_ADD('{pickup_date}', INTERVAL 30 DAY), '{book_copy_id}'
                                WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.book_copies_id = '{book_copy_id}')'''
                cur.execute(statement)
                mysql.connection.commit()
                return 'Book has been ordered!', 204
            except:
                return 'No available book copies', 500

    @app.route('/return_book', methods=['POST'])
    @cross_origin()
    @jwt_required
    def return_book():
        user_id = request.json.get('user_id')
        cur = mysql.connection.cursor()
        statement = f'''SELECT * FROM users WHERE id = '{user_id}' AND is_admin=1'''
        cur.execute(statement)
        result = cur.fetchall()

        if len(result) == 0:
            return "Access forbidden", 403
        else:
            order_id = request.json.get('order_id')
            cur = mysql.connection.cursor()
            try:
                statement = f'''DELETE FROM orders WHERE id = '{order_id}' '''
                cur.execute(statement)
                mysql.connection.commit()
                return 'Book has been returned', 204
            except:
                return 'Book hasnt been returned', 500

    @app.route('/get_user_data', methods=['POST'])
    @cross_origin()
    @jwt_required
    def get_user_data():
        user_id = request.json.get('user_id')
        cur = mysql.connection.cursor()
        try:
            statement = f'''SELECT fname, lname, email, rented_books FROM users WHERE id = '{user_id}' '''
            cur.execute(statement)
            user_data = cur.fetchall()
            statement = f'''SELECT author.fname, author.lname, book.title, DATEDIFF(o.return_date, CURDATE()), 
                            o.is_prolonged, o.id
                            FROM authors author, books book, book_copies copy, orders o WHERE o.user_id = '{user_id}' 
                            AND o.book_copies_id = copy.id AND copy.books_id = book.id AND book.author_id = author.id'''
            cur.execute(statement)
            user_books = cur.fetchall()
            result = user_data + user_books
            return jsonify(result), 200
        except:
            return 'Couldnt get user data', 500

    @app.route('/prolong', methods=['POST'])
    @cross_origin()
    @jwt_required
    def prolong():
        order_id = request.json.get('order_id')
        cur = mysql.connection.cursor()
        try:
            statement = f'''UPDATE orders SET is_prolonged = 1, return_date = DATE_ADD(return_date, INTERVAL 30 DAY)
                            WHERE id = '{order_id}' '''
            cur.execute(statement)
            mysql.connection.commit()
            return 'Prolonged', 204
        except:
            return 'Didnt prolong', 500

    @app.route('/change_password', methods=['POST'])
    @cross_origin()
    @jwt_required
    def change_password():
        user_id = request.json.get('user_id')
        current_password = request.json.get('current_password')
        new_password = request.json.get('new_password')
        cur = mysql.connection.cursor()
        statement = f'''SELECT password FROM users WHERE id = '{user_id}' '''
        cur.execute(statement)
        result = cur.fetchall()

        if result[0][0] == hash_password(current_password):
            db_password = hash_password(new_password)
            statement = f'''UPDATE users SET password = '{db_password}' WHERE id = '{user_id}' '''
            cur.execute(statement)
            mysql.connection.commit()
            return 'Password has been changed', 204
        else:
            return 'Incorrect password', 401

    @app.route('/add_author', methods=['POST'])
    @cross_origin()
    @jwt_required
    def add_author():
        user_id = request.json.get('user_id')
        cur = mysql.connection.cursor()
        statement = f'''SELECT * FROM users WHERE id = '{user_id}' AND is_admin=1'''
        cur.execute(statement)
        result = cur.fetchall()
        if len(result) == 0:
            return "Access forbidden", 403
        else:
            fname = request.json.get('fname')
            lname = request.json.get('lname')
            statement = f'''INSERT INTO authors(fname, lname) VALUES ('{fname}', '{lname}')'''
            cur.execute(statement)
            mysql.connection.commit()
            return "Author has been added", 204

    @app.route('/add_category', methods=['POST'])
    @cross_origin()
    @jwt_required
    def add_category():
        user_id = request.json.get('user_id')
        cur = mysql.connection.cursor()
        statement = f'''SELECT * FROM users WHERE id = '{user_id}' AND is_admin=1'''
        cur.execute(statement)
        result = cur.fetchall()
        if len(result) == 0:
            return "Access forbidden", 403
        else:
            name = request.json.get('name')
            statement = f'''INSERT INTO categories(name) VALUES ('{name}')'''
            cur.execute(statement)
            mysql.connection.commit()
            return "Category has been added", 204

    @app.route('/get_ACP', methods=['GET'])
    @cross_origin()
    @jwt_required
    def get_ACP():
        cur = mysql.connection.cursor()
        statement = "SELECT * FROM authors"
        cur.execute(statement)
        authors = cur.fetchall()

        statement = "SELECT * FROM categories"
        cur.execute(statement)
        categories = cur.fetchall()

        statement = "SELECT * FROM publishers"
        cur.execute(statement)
        publishers = cur.fetchall()

        result = {'authors': authors, 'categories': categories, 'publishers': publishers}
        return jsonify(result), 200

    @app.route('/add_publisher', methods=['POST'])
    @cross_origin()
    @jwt_required
    def add_publisher():
        user_id = request.json.get('user_id')
        cur = mysql.connection.cursor()
        statement = f'''SELECT * FROM users WHERE id = '{user_id}' AND is_admin=1'''
        cur.execute(statement)
        result = cur.fetchall()
        if len(result) == 0:
            return "Access forbidden", 403
        else:
            name = request.json.get('name')
            statement = f'''INSERT INTO publishers(name) VALUES ('{name}')'''
            cur.execute(statement)
            mysql.connection.commit()
            return "Publisher has been added", 204

    @app.route('/add_books', methods=['POST'])
    @cross_origin()
    @jwt_required
    def add_books():
        user_id = request.json.get('user_id')
        cur = mysql.connection.cursor()
        statement = f'''SELECT * FROM users WHERE id = '{user_id}' AND is_admin=1'''
        cur.execute(statement)
        result = cur.fetchall()
        if len(result) == 0:
            return "Access forbidden", 403
        else:
            fname = request.json.get('fname')
            lname = request.json.get('lname')
            statement = f'''SELECT id FROM authors WHERE fname = '{fname}' AND lname = '{lname}' '''
            cur.execute(statement)
            result = cur.fetchall()
            if len(result) != 0:
                author_id = result[0][0]
            else:
                return 'noAuthor', 500

            publisher = request.json.get('publisher')
            statement = f'''SELECT id FROM publishers WHERE name = '{publisher}' '''
            cur.execute(statement)
            result = cur.fetchall()
            if len(result) != 0:
                publisher_id = result[0][0]
            else:
                return 'noPublisher', 500

            category = request.json.get('category')
            statement = f'''SELECT id FROM categories WHERE name = '{category}' '''
            cur.execute(statement)
            result = cur.fetchall()
            if len(result) != 0:
                category_id = result[0][0]
            else:
                return 'noCategory', 500

            title = request.json.get('title')
            year = request.json.get('year')
            amount = int(request.json.get('amount'))

            statement = f'''SELECT id FROM books WHERE title = '{title}' AND  year_release = '{year}' 
                            AND author_id = '{author_id}' AND publisher_id = '{publisher_id}' '''
            cur.execute(statement)
            result = cur.fetchall()

            if len(result) == 0:
                statement = f'''INSERT INTO books (title, year_release, author_id, publisher_id) VALUES ('{title}', 
                                '{year}', '{author_id}', '{publisher_id}') '''
                cur.execute(statement)

                statement = 'SELECT * FROM books ORDER BY id DESC LIMIT 1'
                cur.execute(statement)
                result = cur.fetchall()
                book_id = result[0][0]

                statement = f'''INSERT INTO books_has_categories VALUES ('{book_id}', '{category_id}') '''
                cur.execute(statement)
            else:
                book_id = result[0][0]

            statement = f'''INSERT INTO book_copies (books_id) VALUES ('{book_id}') '''
            for i in range(amount):
                cur.execute(statement)
                mysql.connection.commit()

            return "Book has been added", 204

    return app
