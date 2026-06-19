CREATE TABLE breeds (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  species VARCHAR(10) NOT NULL CHECK (species IN ('Dog', 'Cat')),
  UNIQUE(name, species)
);

INSERT INTO breeds (name, species) VALUES
('Labrador Retriever','Dog'),('Golden Retriever','Dog'),('German Shepherd','Dog'),
('French Bulldog','Dog'),('Bulldog','Dog'),('Poodle','Dog'),('Beagle','Dog'),
('Rottweiler','Dog'),('Dachshund','Dog'),('Pembroke Welsh Corgi','Dog'),
('Australian Shepherd','Dog'),('Border Collie','Dog'),('Siberian Husky','Dog'),
('Great Dane','Dog'),('Miniature Schnauzer','Dog'),('Boxer','Dog'),
('Cavalier King Charles Spaniel','Dog'),('Shih Tzu','Dog'),('Boston Terrier','Dog'),
('Pomeranian','Dog'),('Havanese','Dog'),('Shetland Sheepdog','Dog'),
('Bernese Mountain Dog','Dog'),('Maltese','Dog'),('Chihuahua','Dog'),
('Samoyed','Dog'),('Cocker Spaniel','Dog'),('Staffordshire Bull Terrier','Dog'),
('Australian Cattle Dog','Dog'),('Kelpie','Dog'),('Greyhound','Dog'),
('Whippet','Dog'),('Jack Russell Terrier','Dog'),('Pug','Dog'),('Mixed Breed','Dog'),
('Domestic Shorthair','Cat'),('Domestic Longhair','Cat'),('Persian','Cat'),
('Maine Coon','Cat'),('Siamese','Cat'),('Ragdoll','Cat'),('Bengal','Cat'),
('Sphynx','Cat'),('British Shorthair','Cat'),('Abyssinian','Cat'),
('Scottish Fold','Cat'),('Birman','Cat'),('Russian Blue','Cat'),
('Norwegian Forest Cat','Cat'),('Devon Rex','Cat'),('Burmese','Cat'),
('Tonkinese','Cat'),('Mixed Breed','Cat');
