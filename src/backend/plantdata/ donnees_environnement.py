class DonneesEnvironnement:
    def __init__(self,timestamp,humidite_sol,temperature,niveau_eau):
        self.timestamp=timestamp
        self.humidite_sol=humidite_sol
        self.temperature=temperature
        self.niveau_eau=niveau_eau

    def enregistrer(self):
            # DonneesEnvironnement.objects.create(
            # timestamp=self.timestamp,
             # humidite_sol=self.humidite_sol,
            # temperature=self.temperature,
             # niveau_eau=self.niveau_eau
                         # )
        print(f"Données enregistrées: temp={self.temperature}, humidite={self.humidite_sol}, niveau_eau={self.niveau_eau}")