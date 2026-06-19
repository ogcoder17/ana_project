from database.connection import engine
from database.session import Base

import models.user
import models.product
import models.negotiation
import models.seller_product

if __name__ == "__main__":
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database reset complete.")