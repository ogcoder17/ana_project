# models/decision_model.py

class DecisionModel:
    @staticmethod
    def decide(buyer_offer, seller_offer):
        if buyer_offer >= seller_offer:
            return "Accept"
        return "Counter"