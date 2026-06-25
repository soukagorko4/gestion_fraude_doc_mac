############# PREALABLE ###########

# 1. Démarrer PostgreSQL
brew services restart postgresql@16

# 2. Vérifier
pg_isready

# 3. Vérifier
locale

#4. Revenir dans PostgreSQL
psql postgres

#5. Créer votre base
CREATE DATABASE nextdb;

#6. Quitter PostgreSQL
\q

# 7. Vérifier les bases
psql -l