from sqlalchemy.orm import sessionmaker, declarative_base
from database.connection import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()