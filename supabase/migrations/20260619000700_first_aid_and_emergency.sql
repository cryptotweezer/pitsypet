CREATE TABLE first_aid_recommendations (
  recommendation_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_name        VARCHAR(100) NOT NULL,
  risk_level          VARCHAR(20) NOT NULL DEFAULT 'Low',
  age_range           VARCHAR(50) NOT NULL DEFAULT 'Any',
  recommendation_text TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE emergency_contacts (
  contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(200) NOT NULL,
  state      VARCHAR(10) NOT NULL,
  address    TEXT,
  phone      VARCHAR(30) NOT NULL,
  is_24h     BOOLEAN NOT NULL DEFAULT TRUE,
  website    VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO emergency_contacts (name, state, phone, address, is_24h, website) VALUES
('Animal Emergency Australia (National Hotline)','ALL','1300 226 226',NULL,true,'https://animalemergency.com.au'),
('SASH - Small Animal Specialist Hospital','NSW','(02) 9197 4444','1 Richardson Place, North Ryde NSW 2113',true,'https://sashvets.com'),
('Animal Referral Hospital Sydney','NSW','(02) 9190 9999','250 Parramatta Road, Homebush NSW 2140',true,'https://arh.net.au'),
('Veterinary Emergency Group Melbourne','VIC','(03) 9417 6488','400 Hoddle St, Clifton Hill VIC 3068',true,NULL),
('University of Melbourne Veterinary Hospital','VIC','(03) 9731 2000','250 Princes Hwy, Werribee VIC 3030',true,'https://vetschool.unimelb.edu.au'),
('Animal Emergency Service Brisbane','QLD','(07) 3423 1888','2/45 Bardon St, Stafford QLD 4053',true,'https://aes.com.au'),
('Perth Animal Hospital','WA','(08) 9204 0400','305 Selby Street, Osborne Park WA 6017',true,NULL),
('Adelaide Animal Emergency Centre','SA','(08) 8336 6111','243 Payneham Road, Felixstow SA 5070',true,NULL);
