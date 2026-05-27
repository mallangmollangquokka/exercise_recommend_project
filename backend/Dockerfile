FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir flask flask-cors
RUN python init_db.py
EXPOSE 5000
CMD ["python", "app.py"]