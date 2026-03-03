# models/preference_model.py

class PreferenceModel:
    def __init__(self, price_range, quantity, delivery_days, budget):
        self.price_range = price_range
        self.quantity = quantity
        self.delivery_days = delivery_days
        self.budget = budget

    def utility_score(self, offer_price):
        if offer_price <= self.budget:
            return 1 - (offer_price / self.budget)
        return -1