from database.session import Base
from database.connection import engine
import models.user

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")