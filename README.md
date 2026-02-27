LabVert

Projet réalisé dans le cadre du cours :
Projet d’intégration en sciences, informatique et mathématiques
420-SF4-RE

Présenté à : Monsieur Raouf Babari
Date : 13 février 2026

Équipe – Groupe 02 :

Douaa Bouhlal

Abyan-Rahima Elmi

Selma Hajjami

Description du projet

LabVert est un système d’arrosage intelligent connecté permettant de surveiller en temps réel l’état d’une plante et de gérer son arrosage de manière optimale.

Le système propose deux modes de fonctionnement :

Mode manuel : l’utilisateur contrôle l’arrosage via une interface web.

Mode automatique : une intelligence artificielle analyse les données des capteurs et décide d’arroser la plante selon ses besoins spécifiques.

L’équipe

Le projet est réalisé par une équipe de trois membres collaborant sur tous les aspects du développement (matériel, logiciel et interface).

Répartition des tâches principales :

Selma : Développement matériel, backend et interface

Douaa : Backend, intelligence artificielle et interface

Abyan : Interface utilisateur, matériel et backend

L’idée

Les plantes nécessitent un arrosage adapté selon :

leur espèce

la température ambiante

l’humidité du sol

Cependant, il est difficile pour un utilisateur moyen de connaître ces paramètres sans équipement spécialisé.
LabVert automatise ce processus grâce à des capteurs et un système intelligent.

Utilité
À quoi sert l’application ?

Elle permet de :

Surveiller l’humidité du sol

Mesurer la température ambiante

Afficher les données en temps réel

Arroser uniquement lorsque c’est nécessaire

Problème réel résolu

Un arrosage inadéquat peut provoquer :

Pourriture des racines (sur-arrosage)

Dessèchement et mort (sous-arrosage)

Maladies fongiques

Stress hydrique

LabVert évite :

le gaspillage d’eau

l’arrosage au hasard

la détérioration de la plante

Innovation
Nouveauté du projet

Contrairement aux applications classiques qui donnent seulement des conseils ou des rappels, LabVert arrose automatiquement la plante selon ses besoins réels.

Valeur ajoutée

Le système est conçu pour être :

Accessible aux personnes âgées

Adapté aux personnes en situation de handicap

Pratique pour les personnes occupées

Idéal pour les débutants en jardinage

Public cible

L’application s’adresse à :

Propriétaires de plantes (maison, bureau, appartement)

Personnes qui oublient d’arroser

Débutants en jardinage

Personnes âgées

Personnes en situation de handicap

Objectif : rendre l’entretien des plantes simple, automatique et accessible à tous.

Cas d’utilisation
Acteurs
Acteur	Rôle
Secrétaire	Administration
Utilisateur	Exploitation du système
Plante	Source de données et bénéficiaire de l’arrosage
Scénarios

Saisie des informations de la plante (type, nom)

Arrosage manuel

Arrosage automatique

Enregistrement et affichage des conditions (température, humidité)

Technologies utilisées
Matériel

ESP32

Capteur DHT11 (température et humidité)

Capteur d’humidité du sol FC-28

Pompe submersible

Langages

C++

Python

HTML

CSS

JavaScript

Outils

Visual Studio Code

Git

Justification des choix
C++

Utilisé pour la gestion des capteurs et du système matériel.
Langage performant adapté aux systèmes embarqués.

Python

Permet le traitement des données et la communication entre le matériel et l’interface web.

HTML / CSS / JavaScript

HTML : structure du site

CSS : design et accessibilité

JavaScript : interactivité et affichage en temps réel

Visual Studio Code

IDE léger, compatible avec tous les langages du projet.

Git

Gestion des versions et travail collaboratif efficace.

Liens avec les autres matières
Mathématiques et statistiques

Calculs : minimum, maximum, médiane

Analyse de tendances

Visualisation graphique des données

Électronique et systèmes embarqués

Conception de circuits

Communication Wi-Fi

Intégration ESP32

Défis et difficultés
Défis techniques

Mesure précise de l’humidité du sol

Surveillance continue des données

Gestion du niveau d’eau

Adaptation de l’arrosage selon le type de plante

Prévention du sur-arrosage et du sous-arrosage

Difficultés rencontrées

Apprentissage de nouveaux langages de programmation

Intégration matériel–logiciel

Contraintes liées au matériel et à la précision des capteurs

Conclusion

LabVert est un projet qui combine surveillance en temps réel, automatisation de l’arrosage et interface conviviale afin de répondre aux besoins spécifiques des plantes.

Il met en avant l’innovation, l’accessibilité et l’efficacité pour proposer une solution pratique et moderne d’entretien des plantes.
