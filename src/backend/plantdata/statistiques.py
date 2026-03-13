import statistics
class Statistique:
    def __init__(self,minimum,maximum,moyenne,mediane):
        pass
      
    def calculer(self, donnees):
        self.minimum=min(donnees)
        self.maximum=max(donnees)
        self.moyenne=sum(donnees)/len(donnees)
        self.mediane=statistics.median(donnees)