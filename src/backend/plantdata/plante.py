class Plante:
    def __init__(self, id, nom, type, seuil_humidite, temperature_optimale):
        self.id = id
        self.nom = nom
        self.type = type
        self.seuil_humidite = seuil_humidite
        self.temperature_optimale = temperature_optimale

    def getBesoin(self):
        return {
            "humidite": self.seuil_humidite,
            "temperature": self.temperature_optimale,
        }
    
    

