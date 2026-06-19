Pitsypet: AI-Powered Veterinary Triage System An Australian Market Pilot Andres Henao S8103043 Group 3 NIT3003 - Capstone Project 1 Victoria University Dr. Sardar Farhad January 2026

TABLE OF CONTENTS 

Introduction 
Background
Competitors and their limitations
Market Gap
Project aim and objectives
Project Scope
Functional Requirements
Registration/activation and pet profile management
Symptom input and management
AI-Powered conversational triage, risk Classification and history search
Symptom information and First-Aid recommendations
Results, disclaimer, and veterinary referral
Non-Functional Requirements 
Security
Usability 
Reliability
Use Cases
Register and activate account
Create pet profile
Conduct symptom assessment (AI Triage)
Search assessment history 
View assessment results and veterinary referral 
Sequence Diagrams
Resource Management Plan 
Pseudocode
UI/UX Design 
Timeline 
Conclusion 
References

LIST OF TABLES 
Table 1. Pets Table
Table 2. Conversation Messages
Table 3. Assessments Table
Table 4. Veterinary Knowledge
Table 5. Fist-Aid recommendations
Table 6. PitsyPet’s Use Cases
Table 7. Hardware Resources
Table 8. PitsyPet’s Software Resources
Table 9. PitsyPet’s Human Resources
Table 10. Skills to develop the project
Table 11. Project’s budget


LIST OF FIGURES 
Fig 1. Sequence Diagram 1 (SD1
Fig 2. Sequence Diagram 2 (SD2)
Fig 3. Sequence Diagram 3 (SD3)
Fig 4. PitsyPet’s main Dashboard with pet profiles added (desktop version)
Fig 5. PitsyPet’s main Dashboard without pet profiles added (desktop version)
Fig 6. PitsyPet’s Registration Page
Fig 7. Password and email verification (Example 1)
Fig 8. Password and email verification (Example 2)
Fig 9. Example of a successful registration
Fig 10. Pet Profile Creation in PitsyPet system
Fig 11. AI-powered Assessment Chat
Fig 12. High-Risk Results Page
Fig 13. Medium-Risk Results Page
Fig 14. Low-Risk Results Page
Fig 14. Assessment Search Page

INTRODUCTION 

Background 

Pet ownership continues to rise in Australia, with approximately 73% of households 
owning at least one pet. Dogs and cats remain the most common companion 
animals, and Australian households spend an estimated AUD $1,600–$3,000 per 
year on pet-related expenses, including veterinary care, food, and essential supplies. 
While veterinarians remain the most trusted source of pet health advice, a growing 
number of owners are turning to digital resources for guidance, particularly younger 
and less experienced pet owners, as well as those facing financial constraints. 
(AMA, 2025; Cosgrove, 2026 )

Managing pet health remains a complex challenge for many owners. When pets 
exhibit signs of illness, owners often struggle to assess the urgency of symptoms 
and determine whether immediate veterinary intervention is required or if the 
condition can be safely monitored at home. This uncertainty contributes to high 
levels of anxiety among pet owners that limits their confidence in evaluating 
symptom severity. Existing online sources of information frequently provide generic 
or unstructured guidance and do not systematically account for individual pet 
characteristics, such as age, breed, or pre-existing conditions (Kogan et al, 2019; 
Fortin-Choquette et al, 2025)

These challenges are further exacerbated by the high cost of veterinary care in 
Australia and limited access to services outside standard business hours. 
Emergency veterinary consultations commonly cost between AUD $180–$350 or 
more (PetCloud, 2025), and financial constraints have led a proportion of Australian 
pet owners to reduce or delay veterinary visits, even when care may be necessary 
(KenResearch, 2024). Access to after-hours veterinary services remains limited, 
particularly in rural and remote regions, and continues to be costly even within urban 
areas (AMA, 2025). As pets do not become ill exclusively during business hours, the 
lack of timely access to professional veterinary guidance can contribute to delayed 
treatment, unnecessary emergency visits, and increased health risks.  

Together, these factors highlight the need for accessible, structured, and reliable 
tools that can support Australian pet owners in assessing symptom urgency and 
making informed, timely decisions regarding veterinary care. 

Competitors and limitations 

PetMD Symptom Checker (2026): offers a basic symptom checker that allows pet 
owners to input symptoms and receive general information about possible 
conditions. However, it lacks sophisticated AI-driven triage, does not provide risk 
classification (Low/Medium/ High), offers only generic advice without personalisation 
based on pet characteristics (age, breed, weight), and does not integrate veterinary 
referral pathways or emergency contact features. 

Telemedicine Veterinary Services (FirstVet / Joii, 2026): offer lower-cost 
consultations (approximately AUD $50–$80) compared to in-person visits but present 
some limitations. These services often involve wait times, require upfront payment 
(which may deter cost-conscious pet owners), and lack triage tools to help pet 
owners assess symptom urgency before engaging with a veterinarian. 

General Pet Health Apps (Vet Street, 2026): offer features such as appointment 
scheduling, vaccination reminders, and general pet health information. However, 
these apps lack sophisticated symptom-checking capabilities and do not employ AI
driven triage systems. They are primarily informational tools rather than diagnostic 
aids, and they do not help pet owners assess the urgency of acute symptoms. 

Web-Based Symptom Information (Google Search, Pet Health Websites, 2026): 
many pet owners rely on general web searches to understand symptoms. However, 
web search results are not contextualised to the individual pet's characteristics 
leading to inaccurate guidance. Information quality is highly variable, with some 
sources providing reliable information while others spread misinformation. Pet 
owners lack a systematic framework to evaluate symptom severity, and they receive 
generic lists of possible conditions rather than structured, actionable guidance. 

Market Gap 

Despite the existence of pet health apps, a significant gap remains: there is no 
accessible, AI-powered symptom triage system that provides immediate 24/7 
personalised assessment of pet symptoms without requiring upfront payment or 
veterinarian consultation. Such a system would serve as a critical first-line filter, 
helping pet owners make informed decisions about whether to seek emergency care, 
schedule a regular appointment, or manage the condition at home with appropriate 
guidance. 

Project aim and objectives 

The main aim of this project is to develop an intelligent, accessible web-based 
platform that empowers Australian pet owners to receive immediate, AI-driven triage 
assessment of their dog's or cat's symptoms, enabling them to make informed 
decisions about veterinary care urgency while reducing unnecessary emergency 
visits and improving access to guidance outside regular business hours. 

Objectives 

- Design and implement a functional AI-powered symptom triage system that classifies pet symptoms into risk categories (Low, Medium, High) based on symptom type, severity, duration, and combination patterns; pet-specific characteristics (species, breed, age, weight); and veterinary clinical guidelines such RSPCA Australia and AVA protocols (RSPCA, 2026; AVA, 2026).
- Provide a user-friendly web interface that provides intuitive conversational symptom input interface (target <5 minutes per assessment), personalised risk assessment with clear clinical reasoning, actionable guidance (first-aid recommendations for low risk), veterinary referral pathways (medium/high risk), 24/7 availability through cloud-hosted infrastructure and mobile-responsive design (320px-1920px) with WCAG 2.1 Level AA compliance, and security (parameterised queries for SQL injection prevention).
- Validate product with 10 Australian pet owners for user acceptance testing (recruited via social media and local community) and collect quantitative feedback via surveys (target 4.0/5.0 satisfaction)
- Establish technical foundation for startup scaling in the future by delivering a functional MVP with core features and providing next steps to define product roadmap and post-launch enhancements.

Project Scope 

The main functionality of this project includes user account management, pet profile creation with breed-specific health considerations, an interactive symptom assessment interface, and an AI-driven recommendation engine that guides users toward appropriate veterinary care. The deliverable will be a responsive web application with a complete backend, API management, secure database, and user friendly dashboard that demonstrates the viability of AI-assisted pet healthcare decision-making. All development will focus on cats and dogs as the primary companion animals, with symptom databases covering the most frequently reported health concerns among Australian pet owners.

PitsyPet’s initial deployment focuses on Australian pet owners as a strategic pilot market, with an architecture designed for global scalability. Australia was selected for initial validation due to English language AI performance, well-established veterinary guidelines from sources such RSPCA Australia, and the Australian Veterinary Association. However, the system's technology stack enables expansion to international markets following successful validation and user feedback in Australia. 

Advanced capabilities of PitsyPet such as mobile apps, real-time video vet consultations con licensed veterinarians, AI advanced diagnostic capabilities, pet insurance integration, support for exotic pets, e-commerce, multilingual support, and veterinary clinic partnerships are planned for future development to enable scalability and commercial growth. The system is designed to incorporate a freemium business model with basic triage available to all users and premium features available through subscription.

FUNCTIONAL REQUIREMENTS 

1. REGISTRATION/ ACTIVATION, AND PET PROFILE MANAGEMENT 

Front-End

The process is split into different stages to ensure security:

The user completes a “User registration form" (Email, Password, Name). Upon submission, the interface displays a "Verification Pending" modal, informing the user that an activation link has been sent to their email. The user cannot proceed to create a pet profile until they click this link

Once the email is verified via the link, the user is redirected to the “Pet profile creation” dashboard. Here, they see clearly labeled input fields for their animal: Name, Species (Dog/Cat), Breed (with autocomplete), Age, and Weight. The "Save profile" button remains disabled until all mandatory fields are valid

Once the user completes all required fields, a “Save profile" button becomes enabled. Upon clicking this button, the application displays a loading indicator and then confirms successful registration and a button “You can now check symptoms”. The user is then redirected to the symptom input interface, where they can immediately start the assessment.

The system allows users to register multiple pets, with a dashboard showing all registered pets and the ability to switch between them.

Server-End 

The registration and activation process is managed through Supabase Auth, which 
provides an authentication system with built-in email verification via magic links 
(Supabase, 2026) 

Step 1 - User registration: when the user submits the registration form (email, 
password, name), the frontend calls the Supabase Auth API (Supabase, 2026) 
For validation, the email must be valid and unique format. The password must have 
minimum 8 characters and contain uppercase, lowercase, number, and special 
character. The user name must be between 2-100 characters. If validation fails, 
Supabase returns error responses with specific messages. 

If validation succeeds, Supabase Auth internally performs the following operations:

Validates email format and password strength requirements - 
Hashes password using bcrypt with cost factor 10
Generates unique user_id (UUID v4 format)
Creates record in auth.users table with email_confirmed_at = NULL
Generates cryptographically secure magic link token (24-hour expiry, single-use)
Sends verification email automatically via Supabase's built-in email service
Returns user object with session tokens

The server returns HTTP 201 created with message: "Registration successful. Check your email to confirm account."

Step 2 - Email verification: when the user clicks the magic link in their email, Supabase Auth automatically handles the verification process. 

Supabase Auth internally:

Validates token exists and hasn't expired (<24 hours)
Updates auth.users table: email_confirmed_at = current timestamp
Marks the magic link token as used (prevents reuse)
Generates JWT access token and refresh token
Creates authenticated session

If invalid or expired:

Returns HTTP 400 Bad Request with error message "Invalid or expired verification link" •

Frontend offers "Resend verification email" 

option Step 3: Pet profile creation: Only authenticated users with confirmed email can access the /api/pets/register endpoint. The server verifies authentication by validating the JWT token from Supabase Auth in the request header.

When the user submits the pet profile form, the server validates: 

• pet_name: required, string, 2-50 characters, alphanumeric + spaces 
• species: required, ENUM: "Dog" or "Cat" (case-insensitive) 
• breed: required, string, 2-100 characters, validated against breed database 
• age_years: required, integer, 0-25 
• age_months: optional, integer, 0-11 (only if age_years < 25) 
• weight_kg: required, decimal(5,2), species-specific validation: 
◦ Dogs: 0.5 - 120 kg (covers Chihuahua to Mastiff) 
◦ Cats: 0.3 - 15 kg (covers newborn to Maine Coon) 
• medical_conditions: optional, array of strings, max 10 conditions, each max 
100 characters 

The breed field uses a standardised breed database to ensure consistency with 
veterinary knowledge systems. When users type, the server returns autocomplete 
suggestions from a predefined list of recognised breeds.

HTTP Response Codes: 

• 201 Created: Pet profile successfully created, returns pet_id 
• 400 Bad Request: Validation failed (missing/invalid fields) 
• 401 Unauthorised: User not authenticated or account not activated 
• 409 Conflict: Pet name already exists for this user (optional uniqueness 
constraint) 

Upon successful creation, the server generates a unique pet_id (UUID format) and 
stores the record in Supabase PostgreSQL. The response includes the new pet_id 
and confirmation message: "Pet profile created successfully. You can now check 
symptoms.” 

Database

User authentication User authentication is managed by Supabase Auth, which maintains the auth.users table automatically. This table includes fields: id (UUID, primary key), email (unique), encrypted_password (bcrypt hashed), email_confirmed_at (timestamp, NULL until verification), created_at, updated_at, and additional metadata. The system references auth.users.id as a foreign key in application tables. Supabase Auth handles all CRUD operations on this table internally, including password hashing, email verification status, and session management.

| Field              | Type              | Description                    | Example                               |
| ------------------ | ----------------- | ------------------------------ | ------------------------------------- |
| pet_id             | UUID(Primary Key) | Unique identifier for each pet | 550e8400-e29b-41d4- a716-446655440000 |
| user_id            | UUID(Foreign Key) | References auth.users(id)      | 660e8400-e29b-41d4- a716-446655440111 |
| pet_name           | VARCHAR(50)       | Name of pet                    | “Molly”                               |
| species            | ENUM('Dog','Cat') | Species type: Dog or Cat       | “Dog”                                 |
| breed              | VARCHAR(100)      | Pet breed                      | “Golden Retriever”                    |
| age_years          | INTEGER           | Age in years(0-25)             | 5                                     |
| age_months         | INTEGER           | Age in months(0-11)            | 3                                     |
| weight_kg          | DECIMAL(5,2)      | Weight in kilograms            | 28.50                                 |
| medical_conditions | JSONB             | Known medical conditions       | ["Allergies","Hip Dysplasia"]         |
| created_at         | TIMESTAMP         | Record creation time           | 2026-01-26 20:30:00                   |
| updated_at         | TIMESTAMP         | Last modification time         | 2026-01-26 12:30:00                   |
Table 1. Pets Table(Supabase, 2026; Anthropic, 2025)

CRUD operations: CREATE(new pet profile- requires authenticated user with confirmed email), READ(retrieve pet details for symptom assessment), UPDATE(modify pet information), DELETE(remove pet profile with cascade to Assessments table)

2. SYMPTOM INPUT AND MANAGEMENT

Front-End

The symptom assessment interface employs a conversational approach rather than traditional form-based input. Users interact with an Al assistant through a chat interface that combines natural language processing with strategic structured inputs for efficiency. Upon starting an assessment, users select the affected pet from their profile. The Al assistant greets the user by pet name and asks about symptoms'concerns.

Input methods:

.Free-text messages: users can type detailed descriptions naturally

.Quick-select buttons: for common attributes, the Al presents contextual buttons(e.g.,"When did this start?")

.Clarification prompts: the Al asks follow-up questions to gather complete symptom profiles(e.g., duration, frequency)

As the conversation continues, a collapsible sidebar displays extracted symptoms in structured format, allowing users to verify the Al correctly understood their inputs.Users can click any extracted symptom to clarify or modify it.

The interface maintains context throughout the dialogue, preventing repetitive

questions and referencing earlier statements(e.g.,"Earlier you mentioned Max was lethargic. Is he still showing low energy?")

Server-End

The backend processes each user message through a Natural Language Understanding pipeline that extracts symptom entities, attributes, and temporal information. The conversational agent uses a decision tree to determine:

- Whether to request clarification on ambiguous symptoms

- Whether sufficient information exists to proceed to risk classification

- Which follow-up question is most relevant based on extracted symptoms and pet characteristics

 The system validates symptom completeness by checking for critical attributes(symptom name, onset time, severity indicator) before triggering the RAG-based risk assessment stated in Functional Requirement 3.

Database

| Field | Type | Description |
| --- | --- | --- |
| message_id | UUID | Unique message identifier |
| assessment_id | UUID | Foreign key to Assessments |
| role | VARCHAR(20) | "user" or"assistant" |
| content | TEXT | Message text |
| extracted_entities | JSONB | NLU-extracted symptoms and attributes |
| timestamp | TIMESTAMP | Message creation time |


Table 2. Conversation messages(Anthropic, 2025).

CRUD Operations: CREATE(append each message), READ(retrieve conversation history), UPDATE(modify extracted_entities if user corrects Al understanding)


3. AI-POWERED CONVERSATIONAL TRIAGE, RISK CLASSIFICATION AND HISTORY SEARCH

Front-End

The assessment interface presents a hybrid conversational experience combining structured inputs with natural language dialogue. Users select their pet from registered profiles and engage in a guided conversation where the Al assistant asks clarifying questions about symptoms, duration, and behavioural changes.

The interface includes quick-response buttons for common attributes(e.g., symptom frequency) alongside a free-text chat input for detailed descriptions. A collapsible symptom summary panel displays extracted symptoms in real-time, while a progress indicator shows the assessment stages: gathering symptoms, analysing, and recommendation.

Upon completion, the system displays a comprehensive result card featuring a colour-coded risk badge(Low/Medium/High), primary concern identification, clinical reasoning in plain language, recommended actions, and emergency veterinary contacts if urgent care is required. Premium users can access additional educational resources about identified conditions. All results can be saved to the user's account history for future reference.

The interface maintains accessibility standards with minimum 14px font sizes,WCAG 2.1 Level AA colour contrast ratios, keyboard navigation support, and screen reader compatibility(Anthropic, 2025).

The interface provides a history(search) functionality where users can view a chronological list of past triage sessions. At the top of this dashboard, a“Search Bar” allows the user to filter previous chats by keywords(e.g.,"vomiting,""limp,"January"). As the user types, the list dynamically filters to show only matching assessments. Clicking a result re-opens the full chat transcript and risk classification card.


Server-End

The backend implements a four-tier Al architecture combining conversational intelligence, knowledge retrieval, specialised risk classification, and search:

Tier 1: Conversational agent

A conversational Al agent manages the dialogue flow, extracting structured symptom data from natural language inputs while maintaining conversation context. The agent determines when sufficient information has been gathered for risk assessment and asks intelligent follow-up questions to clarify ambiguous symptoms.

Tier 2: RAG knowledge retrieval system

To address the limitations of standard generative Al(such as hallucinations or outdated information), PitsyPet implements a Retrieval-Augmented Generation(RAG) architecture. RAG is a technique that optimises the output of a Large Language Model(LLM) by referencing an authoritative external knowledge base outside its training data before generating a response. RAG extends the already powerful capabilities of LLMs to specific domains or an organisation's internal knowledge base, all without the need to retrain the model. It is a cost-effective approach to improving LLM output so it remains relevant, accurate, and useful in various contexts(Woodlock,2024; IBM,2024; IBM,2025, KodeKloud,2025)

Unlike a standard chatbot that relies on pre-trained patterns, the RAG system first retrieves relevant veterinary guidelines(from RSPCA or AVA protocols) from Supabase PostgreSQL with the pgvector extension based on the user's query(Supabase, 2026; pgvector, 2026). Then it feeds this retrieved"ground truth" to the Al model(Claude Sonnet) to generate an answer. This ensures that every triage recommendation is grounded in verified clinical data rather than statistical probability alone.


Implementation:

When adequate symptom information is collected, the system performs semantic search against Supabase PostgreSQL containing embeddings of veterinary textbooks, peer-reviewed journals, and clinical guidelines. The knowledge base is pre-processed and chunked into 300-500 token segments, each tagged with metadata including species, body system, urgency level, and breed-specific considerations.

The retrieval process includes:

- Query embedding generation: the system generates a 1536-dimensional embedding vector for the symptom query using OpenAl's text-embedding-3-large model.

- Vector similarity search: the system executes a pgvector similarity search query in Supabase PostgreSQL.

- Metadata filtering: the query filters results by species(Dog/Cat) and urgency_level(≥5 for moderate-to-high urgency content) to ensure retrieved knowledge is contextually appropriate.

- Performance: typical query response time is 200-300ms for the veterinary knowledge base containing 2,000-10,000 chunks. While dedicated vector databases like Pinecone offer<50ms latency, the 200-300ms pgvector performance represents only 3-8% of the total 3-8 second conversation assessment time, making it imperceptible to users while providing the advantage of consolidated data storage in a single PostgreSQL database.

The retrieval system returns the top 5 most relevant knowledge chunks based on symptom combination, pet characteristics(breed, age, weight), and urgency context.

Tier 3: Al Risk classification with structured prompting

The MVP uses a carefully engineered prompt template with Claude Sonnet that


processes extracted symptoms(from Tier 1), retrieved veterinary knowledge(from Tier 2: RAG), and pet characteristics(age, breed, weight, medical conditions).

The prompt instructs the model to:

- Analyse symptom severity based on veterinary guidelines

- Consider breed-specific risk factors(e.g., brachycephalic breeds+ breathing issues)

- Classify risk level(Low/Medium/High) with confidence score

- Provide clinical reasoning in plain language

- Generate actionable recommendations

 Once more real user assessments are collected and validated by veterinarians, the system can be upgraded to a fine-tuned model for improved accuracy and consistency. The MVP's prompt-based approach establishes the data pipeline and evaluation framework needed for future fine-tuning.

Tier 4: Conversation history search

The search functionality allows users to retrieve their past triage assessments using natural language keywords. This feature enhances user experience by enabling quick retrieval of previous symptom evaluations without manually scrolling through chronological history.

Implementation:

- The backend exposes a search endpoint at/api/assessments/search

- The system receives the user's search query(e.g.,"vomiting",“January”)

- All queries use parameterised statements to prevent SQL injection(Fadlallah,2022)

- The server executes a full-text search using PostgreSQL's GIN Index capabilities against these fields: clinical_reasoning(clinical explanation text),extracted_symptoms(symptom names), primary_concern(main condition identified), created_at(date-based queries)(Huda, 2024)


As the user types in the search bar, a debounced API call(300ms delay) is triggered to fetch matching results. The interface dynamically filters the displayed assessment cards, highlighting matched keywords. Clicking a result re-opens the full chat transcript and risk classification card.

Security:

- Server verifies the user_id from the authenticated session token matches the search request

- All SQL queries use bind parameters to prevent SQL injection attacks

- Maximum 30 search requests per minute per user to prevent abuse

Decision validation:

 The confidence score selected for validation was 0.75(75%) based on best practices for medical Al systems. According to Topol(2019), Al-assisted triage tools should employ calibrated confidence scores in the 0.7-0.8 range to balance sensitivity and avoid missed critical cases. For PitsyPet, a 0.75 threshold ensures that only assessments with reasonably high certainty proceed to risk classification, while ambiguous cases trigger additional clarifying questions from users to avoid inaccurate guidance.

High-risk assessments automatically trigger emergency contact retrieval and push notifications. The system implements caching strategies to reduce redundant API calls and includes fallback mechanisms(rule-based classification) in case of external service failures.

All assessments are logged with metadata including tokens consumed, processing time, model version, and knowledge sources referenced, enabling continuous quality monitoring and system improvement.


Implementation details:

The conversational agent and risk classification model use Claude Sonnet 4.5(Anthropic) due to its strong reasoning capabilities, long context window(200K tokens), and JSON-structured output support. The RAG knowledge system uses Supabase PostgreSQL with the pgvector extension for vector storage and similarity search, combined with OpenAI Embeddings API(text-embedding-3-large, 1536 dimensions) for generating semantic embeddings(OpenAI, 2026; Supabase, 2026;pgvector,2026).

RAG knowledge sources:

- Merck Veterinary Manual(publicly accessible sections)

- RSPCA Australia pet health database

- Australian Veterinary Association(AVA) public resources-

- PubMed veterinary research papers(open access)

- Peer-reviewed journals: Journal of Small Animal Practice, Australian Veterinary Journal

 All knowledge sources used comply with copyright and licensing restrictions. The MVP will focus on freely available veterinary guidelines and open-access research to ensure legal and ethical use of knowledge materials. Partnerships with veterinary organisations for additional proprietary content can be explored in the future.

Knowledge preprocessing:

Documents are chunked into 300-500 token segments, embedded using OpenAl text-embedding-3-large(1536 dimensions), and stored in Supabase PostgreSQL using the pgvector extension. Each chunk is tagged with metadata filters for species,body system, urgency level, and breed-specific considerations. An IVFFlat(Inverted File with Flat compression) index which is an algorithm for approximate vector search in databases(Approximate Nearest Neighbor- ANN), is created on the


embedding column to enable fast search for the 2,000-10,000 chunk knowledge base(pgvector, 2026).

Quality assurance:

The system implements multiple quality control mechanisms to ensure safe and reliable triage recommendations:

● Automated validation: all high-risk classifications will be automatically validated against predefined emergency criteria and Al responses will be checked for required fields before display. Confidence scores below 0.75 trigger additional clarification prompts rather than displaying uncertain recommendations.

● Manual review during development: A sample of 50+ Al-generated assessments across all risk levels will be manually reviewed against RSPCA and AVA veterinary guidelines to identify systematic errors or unsafe recommendations. Rare conditions will be flagged for additional review.

Post-launch monitoring: User feedback surveys will be used and assessment outcomes will be collected to identify areas for improvement. High-risk assessments that did not result in veterinary visits are flagged for investigation.

● Veterinary consultation in the future: Prior to public launch beyond the capstone project, a licensed veterinarian will be engaged to review the knowledge sources and RAG retrieval accuracy, validate a representative sample of Al-generated triage recommendations, provide guidance on refining risk thresholds and clinical reasoning, and serve as an ongoing advisor for complex cases.



The CRUD operations are CREATE(new assessment initiated), UPDATE(conversation log appended with each message; symptoms extracted incrementally),READ(user retrieves history; system analytics access anonymised data), DELETE(soft delete with 30-day retention).

| Field               | Type         | Description                                         |
| ------------------- | ------------ | --------------------------------------------------- |
| Assessment_id       | UUID         | Primary key                                         |
| pet_id and user_id  | UUID         | Foreign keys                                        |
| conversation_log    | JSONB        | Full dialogue history with timestamps               |
| extracted_symptoms  | JSONB        | Structured symptom data with severity and duration  |
| risk_classification | VARCHAR(20)  | Low/Medium/High Risk                                |
| confidence_score    | DECIMAL(3,2) | Model confidence(0.00-1.00)                         |
| primary_concern     | VARCHAR(255) | Main condition identified                           |
| clinical_reasoning  | TEXT         | Al-generated explanation                            |
| recommended_action  | VARCHAR(50)  | Action category                                     |
| rag_chunks_used     | JSONB        | References to retrieved knowledge sources           |
| model_version       | VARCHAR(100  | Al model version used                               |
| tokens_used         | INTEGER      | Total tokens consumed in API calls                  |
| processing_time_ms  | INTEGER      | Time to generate assessment(milliseconds)           |
| user_saved          | BOOLEAN      | Whether user saved this assessment to their history |
| created_at          | TIMESTAMP    | Assessment start time                               |
| completed_at        | TIMESTAMP    | Assessment completion time                          |


Table 3. Assessments Table- PostgreSQL(Stonebraker,2023; Anthropic,2025).

To support efficient searching, a GIN Index(Generalised Inverted Index) is applied to the clinical_reasoning and extracted_symptoms fields. A GIN Index is designed for handling cases where the items to be indexed are composite values, and the queries to be handled by the index need to search for element values that appear within the


composite items(PostgreSQL, 2026). CRUD operation: READ(execute full-text search query with relevance ranking).

Vector database-pgvector

The veterinary knowledge base is stored in Supabase PostgreSQL using the pgvector extension for efficient vector similarity search.

| Field | Type | Description |
| --- | --- | --- |
| chunk_id | UUID | Primary Key |
| text | TEXT | Veterinary guideline content(300-500 tokens) |
| embedding | vector(1536) | OpenAI text-embedding-3-large vector representation |
| metadata | JSONB | Source, species, body_system, urgency_level, breed_specific flags |
| source | VARCHAR(255) | Publication source(e.g.,"RSPCA Australia","AVA Guidelines" |
| species | VARCHAR(50) | Applicable species:"Dog","Cat", or"Both" |
| urgency_level | INTEGER | Urgency rating on 1-10 scale |
| created_at | TIMESTAMP | Record creation time |
| completed_at | TIMESTAMP | Last modification time |


Table 4. Veterinary knowledge(Anthropic, 2025).

Indexes

The primary key is chunk_id. An IVFFlat index is created on the embedding column for ANN search, configured with 100 lists. This parameter is appropriate for knowledge bases containing 2,000-10,000 chunks and achieves<300ms query times with 95-98% recall accuracy, providing the balance between accurate search and performance required for real-time triage assessments.


Knowledge processing audit table(PostgreSQL)

Tracks source documents processed into the RAG system, including source title,document type(textbook/journal/guideline), total chunks created, processing date,validation status(pending/approved/active), ensuring knowledge provenance and quality control(Stonebraker,2023; Supabase,2026).

Assessment analytics table(PostgreSQL)

Aggregates daily metrics including total assessments, average confidence scores,high-risk case counts, processing times, token usage, and active users, enabling system performance monitoring and continuous improvement(Stonebraker, 2023;Supabase, 2026).

4. SYMPTOM INFORMATION AND FIRST-AID RECOMMENDATIONS

Front-End

Below the triage result, the user sees an"About These Symptoms" section providing educational information. For each reported symptom, the application displays a brief explanation of to the symptom, common causes and when to be concerned.

For Low Risk assessments only, the user additionally sees a"First-Aid Recommendations" section with safe, home-care guidance. These recommendations are personalised based on the pet's age, weight, and specific symptoms.

Server-End

The server retrieves symptom information from the Symptom_Database and formats it for display. For Low Risk cases, the server generates first-aid recommendations by querying a"First_Aid_Recommendations" table based on symptom type and pet characteristics. The server returns this information as part of the triage result response.


Database

| Field | Type | Description |
| --- | --- | --- |
| recommendation_id | UUID | Unique ID |
| symptom_id | UUID | Associated symptom |
| risk_level | VARCHAR(20) | "Low" only |
| age_range | VARCHAR(50) | e.g.,"Adult(2-10 years)" |
| recommendation_text | TEXT | First-aid guidance |


Table 5. First-Aid Recommendations(Anthropic, 2025).

CRUD Operations: READ(retrieve recommendations).

5. RESULTS, DISCLAIMER, AND VETERINARY REFERRAL

Front-End

At the bottom of every symptom assessment result, a prominent legal disclaimer appears in a distinct box:

"IMPORTANT DISCLAIMER: Pitsypet is an educational tool only and does not replace professional veterinary diagnosis, advice, or treatment. The risk classifications provided are based on reported symptoms and are not definitive medical diagnoses. Always consult a licensed veterinarian for accurate diagnosis and treatment. In case of suspected emergency, contact a veterinary clinic or emergency animal hospital immediately. We are not responsible for any health decisions made based on this tool."

For Medium and High Risk cases, the user sees a"Next Steps" section with actionable guidance. A"Save Assessment" button allows users to save the assessment result to their account for future reference.


Server-End

When a user submits a symptom assessment, the server generates a unique assessment_id and stores the complete assessment record(pet_id, symptoms,durations, risk_classification, timestamp). The server also generates a user-friendly summary that can be saved or printed. The server maintains audit logs of all assessments for quality assurance and improvement purposes.

Database

Assessment results are displayed in Table 3. The following fields from the table are specifically used for displaying results and referrals:

- risk_classification: determines which disclaimer and referral guidance to show

- recommended_action: maps to specific veterinary referral instructions

- primary_concern: displayed in the result summary

- clinical_reasoning: shown in the"About Your Results" section

- user_saved: tracks whether user saved the assessment to their history

 CRUD operations: READ(retrieve assessment to display results), UPDATE(if user clicks"Save Assessment" button, user_saved is set to true)(Anthropic, 2025).

NON- FUNCTIONAL REQUIREMENTS

1. Security

- To protect sensitive pet health data and user personal information during transmission, all data transmitted between client and server must be encrypted using TLS 1.3 or higher

- To prevent malicious users from accessing or manipulating database contents, the system must implement SQL injection prevention by using parameterised queries for all database operations(Anthropic, 2025).


2. Usability

- Pet owners need quick answers when worried, therefore, complex interfaces will be abandoned. A new user must be able to complete their first symptom assessment within 5 minutes without external help or instructions.

- 70%+ of pet owners will access the app on mobile when their pet shows symptoms unexpectedly, thus, the application must be fully responsive and functional on mobile devices with screen sizes from 320px to 1920px width.

- To ensures the application is accessible to users with visual impairments or using the app in low-light conditions(common when pets are ill at night), all user interface text must use a minimum font size of 14px and maintain WCAG 2.1 Level AA colour contrast ratios(Anthropic, 2025).

3. Reliability

- The system must maintain 99% uptime from 8 AM- 8 PM AEST, 7 days/week High availability during peak usage hours(when owners are awake and noticing symptoms) ensures the system is accessible when most needed. The 99% target allows for brief planned maintenance windows during off-peak hours(midnight-6AM) while ensuring reliability during critical evening or weekend periods when veterinary clinics are closed and pet owners most need guidance. The MVP will be hosted on a cloud platform with high availability, but formal uptime monitoring will be implemented in the future during the beta testing phase. During capstone development, the staging environment may experience higher downtime due to iterative deployments.

- If the Al triage service fails or times out(>10 seconds), the system must display emergency veterinary contact information within 2 seconds. System reliability is critical in health contexts, therefore, users must receive actionable emergency guidance even during API outages, network failures, or Al service timeouts, rather than encountering a generic error page. The<2s display time refers to immediate rendering of cached emergency content(no network latency) ensuring pet owners are never left without guidance during system failures.


USE CASES(UC)

Table 6 displays each UC along with the primary and secondary actors:



| Use Case | Description | Primary Actor | Secondary Actor |
| --- | --- | --- | --- |
| Register and activate account | New user creates account with email, password, and name. System sends verification email with magic link via Supabase Auth. User clicks magic link to verify email and activate account. | Pet Owner | Supabase Auth, Database |
| Create pet profile | Authenticated user creates pet profile with name, species, breed,age,weight,and medical conditions. | Pet Owner (authenticated) | Database |
| Conduct symptom assessment | User initiates a conversation with Al to describe pet symptoms. System extracts information, retrieves veterinary knowledge, and provides risk classification(Low/Medium/High) with clinical approaching and recommendations. | Pet Owner | AI Conversational Agent(Claude Sonnet), RAG System(Supabase PostgreSQL with pgvector), Risk Classification Model |
| Search assessment history | User searches past assessments using keywords to retrieve previous triage results. | Pet Owner | Database (PostgreSQL with GIN Index) |
| Obtain assessment results and veterinary referral | After completing assessment, user obtains comprehensive results including risk classification, clinical reasoning recommendations, and veterinary referral based on risk level. | Pet Owner | Database |


Table 6. PitsyPet's Use Cases


1. Register and activate account

Pre-conditions:

.User has valid email address

.Email not already registered

Post-conditions:

.•User account created with is_active= TRUE

.User redirected to pet profile creation page

Main flow:

1. User enters email, password, and name in registration form

2. System validates input(email format, password 8+ characters with uppercase/lowercase/number/special character, name 2-100 characters)

3. Frontend calls Supabase Auth API with user credentials

4. Supabase Auth internally validates requirements and hashes password using bcrypt

5. Supabase Auth generates unique user_id(UUID v4) and cryptographically secure magic link token(24-hour expiry, single-use)

6. Supabase Auth creates user record in auth.users table with email_confirmed_at= NULL

7. Supabase Auth sends verification email automatically with magic link

8. System displays"Check your email to activate account"

9. User clicks magic link in email

10. Supabase Auth validates token exists and hasn't expired(<24 hours)

11. Supabase Auth updates auth.users table: email_confirmed_at= current timestamp, marks token as used

12. Supabase Auth generates JWT access and refresh tokens, creates authenticated session

13. System redirects user to pet profile creation page

Alternate flows:

- If email already exists: display"Account exists, please log in"


- User requests resend verification email: Supabase Auth generates new magic link token, sends new email automatically

- Invalid input: display specific validation errors, user corrects and resubmits

- Email service failure: display"Unable to send verification email, try again later"with option to resend

- Expired/invalid magic link: display"Link expired or invalid, request new verification email"

- User clicks magic link multiple times: Supabase Auth recognizes token already used, redirects to login

Quality requirements:

- Password security(managed by Supabase Auth with bcrypt cost factor 10)

- Magic link token expiry(24 hours, single-use)

- Email verification flow handled by Supabase Auth built-in service

- Email service failure handling with resend option

2. Create pet profile

Pre-conditions:

.User logged in with is_active= TRUE

.UC-01 completed

Post-conditions:

.Pet profile created with unique pet_id

.User redirected to symptom assessment interface

Main flow:

1. User enters pet name(2-50 characters)

2. User selects species: Dog or Cat

3. User types breed, system shows autocomplete suggestions

4. User selects breed from list

5. User enters age(years 0-25, optional months 0-11)

6. User enters weight(Dogs: 0.5-120kg, Cats: 0.3-15kg)


7. User optionally enters medical conditions(max 10, 100 chars each)

8. System validates all inputs

9. System generates pet_id, creates record linked to user_id

10. System displays"Pet profile created successfully"

11. System redirects to symptom assessment

Alternate flows:

●User adds multiple pets: click"Add Another Pet", repeat

.Breed not in database: allow manual entry(flag for admin review)

.Invalid input: display specific errors, user corrects

.Session expired: redirect to login

.Duplicate pet name: Display"Pet name exists, use different name"

Quality Requirements:

.Input validation

.•SQL injection prevention

3. Conduct Symptom Assessment(Al Triage)

Pre-conditions:

.User logged in with at least one pet profile

.Operational AI and RAG services

Post-conditions:

.Assessment stored with unique assessment_id

.User receives risk classification with clinical reasoning

.User receives recommendations based on risk level

Main flow:

1. User selects pet from registered profiles

2. Al assistant greets user by pet name and asks about symptoms

3. User describes symptoms in natural language


4. Al extracts structured keywords(symptom="vomiting", onset="yesterday",frequency="3 times")

5. System displays extracted symptoms in collapsible sidebar for user verification

6. Al asks intelligent follow-up questions based on extracted data(frequency,severity, additional symptoms)

7. User responds with additional details, Al updates extracted keywords incrementally

8. System validates symptom completeness(symptom names, onset time, severity indicators present)

9. System generates 1536-dimensional embedding vector for symptom query using OpenAI text-embedding-3-large

10. System performs vector similarity search in Supabase PostgreSQL using pgvector extension with cosine distance operator

11. System retrieves top 5 most relevant veterinary knowledge chunks filtered by species and urgency level(≥5)

12. System sends combined data to Claude Sonnet 4.5(Tier 3): extracted symptoms, pet characteristics(breed, age, weight, medical conditions), retrieved veterinary knowledge chunks

13. Al model analyses symptom severity based on veterinary guidelines and breed-specific risk factors

14. Al model classifies risk level(Low/Medium/High) with confidence score(0.00-1.00)

15. Al model generates clinical reasoning in plain language and actionable recommendations

16. System stores complete assessment in database with unique assessment_id

17. System displays comprehensive results card: colour-coded risk badge, primary concern, clinical reasoning, recommended actions

18. For High Risk: system displays emergency 24/7 veterinary contacts(name,address, phone, distance)

19. System displays legal disclaimer in highlighted box

20. User clicks"Save Assessment" button

21. System updates user_saved= TRUE in database

22. System confirms"Assessment saved to your history


Alternate flows:

- Low risk: display first-aid recommendations, home monitoring guidance, and regular vet appointment suggestion

- Medium risk: display regular vet appointment guidance(within 24 hours),monitoring instructions

- User corrects Al extracted keywords: click symptom in sidebar, edit details, Al acknowledges correction and re-evaluates

- Insufficient symptom information: Al requests specific clarifications before proceeding to risk classification

- Confidence score< 0.75: system requests more details instead of displaying uncertain recommendation

- Al service timeout(>10 seconds): display cached emergency veterinary contacts within 2 seconds, use fallback rule-based classification

- RAG retrieval failure(pgvector search error): proceed with base Al knowledge only, display disclaimer about limited context

- OpenAI Embeddings API failure: use fallback keyword-based retrieval, display notice about reduced accuracy

Quality requirements:

- Complete assessment in<5 minutes

- Fallback mechanisms for all external service failures(Claude API, OpenAl Embeddings, database)

- Emergency contacts displayed<2 seconds on Al timeout

- pgvector search response time<300ms for 2,000-10,000 knowledge chunks

4. Search assessment history

Pre-conditions:

.User logged in

.User has saved assessments(User Case#3 completed)

Post-conditions:

.User views filtered list of matching assessments


●•User can click to re-open full transcript

Main flow:

1. User navigates to Assessment History page

2. System displays chronological list of past assessments

3. User types search(example:"vomiting")

4. System triggers API call(300ms delay)

5. System validates authentication, sends query with user_id

6. System executes PostgreSQL full-text search with parameterised query($1=query,$2=user_id) against: clinical_reasoning, extracted_symptoms,primary_concern, created_at

7. System returns matching results with relevance ranking

8. System dynamically filters displayed cards, highlights matched keywords

9. User clicks result card

10. System retrieves full conversation log, displays transcript and risk card

Alternate flows:

.Date-based search: example:"January"= filter by month

.Pet name search: return all assessments for that pet

.No results: display"No assessments found", show full list

.Invalid session: redirect to login

.Rate limit exceeded(>30 requests/min): display"Too many searches, wait a moment"

.SQL injection attempt: parameterised queries prevent

Quality requirements:

.Parameterised queries(SQL injection prevention)

.Rate limiting(30/min),

.Debounced API(usability)

5. View assessment results and veterinary referral


Pre-conditions:

.•Use Case#3 completed

.Risk classification generated

Post-conditions:

.User viewed complete results with clinical reasoning

.User understands next steps based on risk level

.User acknowledged legal disclaimer

Main flow:

1. System completes risk classification

2. System displays result card with: risk badge(red/orange/green for High/Medium/Low), primary concern, clinical reasoning("Why this assessment?"),recommended action("What to do next?")

3. For High Risk: displays emergency 24/7 veterinary contacts(name, address,phone, distance)

4. System displays legal disclaimer in highlighted box

5. User clicks"Save Assessment"

6. System updates user_saved= TRUE

7. System confirms"Assessment saved to your history"

Alternate flows:

.Medium risk; display regular vet appointment guidance, business hours

.Low risk: display first-aid recommendations,"When to seek care" red flags

.User shares with vet: generate PDF summary with pet profile, symptoms, risk classification

.Assessment data incomplete: display fallback"Contact veterinarian as precaution"

.Emergency contacts unavailable: display"Search'24/7 emergency vet near me'''

.Already saved: display"Assessment already saved"


Quality requirements:

.Coloured risk badges for instant recognition

.Plain language clinical reasoning

.Clickable phone numbers on mobile

SEQUENCE DIAGRAMS(SD)

 The SD for the three most critical system interactions identified in the UC are presented in Fig 1,2 and 3.

Fig 1(SD1) illustrates the complete user registration workflow with email verification via Supabase Auth. The process begins when a pet owner submits their data through the registration form. The frontend calls the Supabase Auth API with the user's email, password, and name. Supabase Auth internally validates the input,hashes the password using bcrypt, and generates a unique user_id. A user record is created in the auth.users table with email_confirmed_at set to NULL. Supabase Auth generates a cryptographically secure magic link token with 24-hour expiry and single-use constraint, then sends a verification email automatically via its built-in email service. The system displays a confirmation message instructing the user to check their email. Upon receiving the email, the user clicks the magic link, which triggers the verification process. Supabase Auth validates that the token exists and has not expired, updates the auth.users table by setting email_confirmed_at to the current timestamp, marks the token as used to prevent reuse, and generates JWT access and refresh tokens to create an authenticated session. Finally, the user is redirected to the pet profile creation page. This approach ensures email ownership verification and account security while eliminating the need for custom authentication code.

Fig 2(SD2) demonstrates the multi-tier Al architecture for symptom triage. The process initiates when a pet owner selects their pet and begins describing symptoms through a conversational chat interface. The Al Agent(Tier 1) processes each message, extracting symptom entities(symptom names, onset times, severity indicators) from natural language input using NLU techniques. The agent asks


follow-up questions to gather a complete symptom profile. Once sufficient information is collected, the system generates a 1536-dimensional embedding vector for the symptom query using OpenAl's text-embedding-3-large model. The system then triggers the RAG System(Tier 2), which performs vector similarity search in Supabase PostgreSQL using the pgvector extension. The query uses the cosine distance operator to find semantically similar veterinary knowledge chunks, filtering by species and minimum urgency level(≥5). The top 5 most relevant knowledge chunks are retrieved from the veterinary_knowledge table, which contains embeddings of veterinary knowledge sources(RSPCA guidelines, AVA protocols,veterinary journals). These chunks are then forwarded to the Risk Classifier(Tier 3),which analyses symptom severity using Claude Sonnet 4.5 with the retrieved veterinary knowledge, considers breed-specific risk factors(e.g., brachycephalic breeds with breathing issues), and generates a risk classification(Low/Medium/High)with a confidence score(0.00-1.00). The complete assessment, including conversation log, extracted symptoms, risk classification, and clinical reasoning, is stored in the Assessments table in Supabase PostgreSQL. Results are displayed to the user with colour-coded risk badges, clinical explanations in plain language, and actionable recommendations. High-risk assessments automatically include emergency veterinary contact information with clinic names, addresses, phone numbers, and distance. Low-risk assessments include first-aid recommendations and home monitoring guidance. The pgvector search typically completes in 200-300ms, which represents only 3-8% of the total 3-8 second assessment time,making the slight latency imperceptible to users while providing the benefit of consolidated data storage in a single PostgreSQL database.

Fig 3(SD3) illustrates the full-text search functionality for past symptom assessments. Users access their Assessment History page, which displays a chronological list of all saved assessments. When the user types a search query(e.g.,"vomiting") in the search bar, the system implements a 300ms debounce delay to avoid excessive server requests during typing. Upon completion, the Search Controller validates the user's authentication via the Supabase session token and executes a PostgreSQL full-text search query using parameterised statements($1,$2) to prevent SQL injection attacks. The query searches across multiple fields:


clinical_reasoning, extracted_symptoms, and primary_concern. A GIN Index applied to these fields enables response times under 200ms even with thousands of assessments. The database returns matching results ranked by relevance score using PostgreSQL's ts_rank function. The UI dynamically filters the displayed assessment cards and highlights matched keywords for visibility. When the user clicks a result, the system retrieves the full conversation log from the JSONB conversation_log field and displays the original risk classification card, enabling users to review past assessments without manual scrolling through chronological history.

RESOURCE MANAGEMENT PLAN

Effective resource management ensures the Pitsypet's MVP is delivered within the timeline and minimal budget constraints. The plan identifies critical resources in hardware, software, and personnel for successful completion.

Hardware resources



| Stage | Item | Critical to |
| --- | --- | --- |
| Development environment | Laptop- personal device(16GB RAM, 512GB SSD, Intel Core i5/M1) | - Support FastAPI server - PostgreSQL |
| Testing environment | Mobile device(iOS16, Android 12) | Validate responsive design and mobile issues that browser cannot replicate |
| Deployment environment | - Vercel(Frontend Hosting): 100GB bandwidth/month(free tier) - Railway(Backend Hosting): plan basic for 50-80 concurrent requests - Supabase(Database, Auth, Storage and Email): 500 mg database, 2GB bandwidth/month, 50K monthly active users(free tier) | - Hosting at zero cost for 12 months - Support 10-15 concurrent users (academic scope) - Automated RDS backups to meet non-functional requirement#3 |


Table 7. PitsyPet's Hardware Resources. Source: Vercel, 2026; Railway, 2026; Supabase, 2026.


Software resources



| Stack | Technology | Critical to |
| --- | --- | --- |
| Backend | Python 3.11+ FastAPI 0.109.0 | - Provide async support for non-blocking Al API calls (3-8 second responses) - Automatic OpenAPI docs for testing - Pydantic validation |
| Backend | Supabase PostgreSQL 15.3 with pgvector extension | - Store user profiles, pet data, assessments with JSONB support for extracted_symptoms and metadata - Enable<300ms vector similarity search using pgvector operators for RAG Tier 2 - Support full-text search with GIN Indexes(<200ms response time for assessment history) - Maintain referential integrity with Foreign Key constraints and CASCADE operations - Ensure assessment data integrity with ACID compliance - Provide built-in authentication, storage, and email services |
| Backend | Supabase Client Libraries | - Simplify database interactions, authentication, and storage operations. Alternative to SQLAlchemy with native Supabase integration. - Prevents SQL injection via automatic parameterised queries. |
| Frontend | Next.js 14 with React 18, Tailwind CSS 3.4 | - Enable Server-Side Rendering(SSR) and Static Site Generation(SSG) for SEO optimisation(critical for organic user acquisition via Google search) Provide automatic image optimisation for pet profile photos(40% faster page loads vs standard React) - Integrate API routes for serverless backend functions - Support responsive design with Tailwind utility classes(320px-1920px viewport range)  Accelerate development with reusable UI components(risk badge, symptom cards, chat interface) |
| AI/ML Services | Claude Sonnet API | - Medical reasoning -200K context window |
| AI/ML Services | Open AI Embeddings API | -Obtain high-quality semantic embeddings - Accuracy on RAG retrieval |





| Monitoring | Sentry(error tracking) | Capture and report runtime errors, API failures, and crashes.Free tier: 5K errors/month |
| --- | --- | --- |
| Monitoring | PostHog(product analytics) | Track feature usage, user flows, and conversion funnels. Free tier: 1M events/month |
| Monitoring | UptimeRobot(uptime monitoring) | Monitor API availability, alert on downtime, track 99% uptime SLA. Free tier: 50 monitors |
| Development Tools | VS Code | Free IDE with Python/React extensions |
| Development Tools | Git+ GitHub/ GitHub Actions | Version control, issue tracking, CI/CD automation |
| Development Tools | Postman | API testing and debugging |
| Development Tools | Trello | Task tracking to comply with timeline |


Table 8. PitsyPet's Software Resources. Source: Phyton, 2026; FastAPI, 2026; Supabase, 2026;pgvector,2026;Next.js,2026;Anthropic,2026;OpenAI,2026;Sentry,2026;PostHog,2026;UptimeRobot,2026;VSC,2026;GitHub,2026;Postman,2026;Trello,2026.

Human Resources(individual work)



| Role | Responsibilities | Time(%) |
| --- | --- | --- |
| Backend Developer | FastAPI API, authentication, database integration | 35% |
| Frontend Developer | React UI, conversational interface, responsive design | 25% |
| AI/ML Engineer | RAG, prompt engineering, Claude integration, knowledge base, risk classification | 20% |
| Project Manager | Timeline management, documentation/communication | 15% |
| Testing | Testing, accessibility validation | 5% |


Table 9. PitsyPet's Human Resources. Source: own elaboration


Skills



| Skill | Level | Application |
| --- | --- | --- |
| Python | Intermediate | FastAPI, SQLAlchemy, Anthropic SDK |
| JavaScript/React | Intermediate | UI, state management, API integration, Next.js 14 SSR/SSG patterns |
| PostgreSQL | Beginner | Schema design, JSONB, full-text search, pgvector extension for vector similarity search |
| FastAPI | Beginner | REST API development, async endpoints, authentication |
| CSS | Beginner | Responsive design |
| AI/LLM Integration | Advanced | Claude API, RAG workflows |
| Git/GitHub | Advanced | Version control, collaboration |


Table 10. Skills to develop the project. Source: own elaboration

Budget

 Minimal cost are achievable through strategic use of free tiers and open-source tools. Al API costs are unavoidable but represent<1% of typical commercial deployment budget.

Category Cost($ month)

| Hardware(personal laptops, mobile devices) | 0 |
| --- | --- |
| Open-source software | 0 |
| Vercel(free tier) | 0 |
| Railway | 20 |
| Supabase(free tier) | 0 |
| Claude Sonnet 4.5 API(covering around 5000 assessments) | 50-100 |

| OpenAI Embeddings API(13 million tokens) | 10-20 |
| --- | --- |
| Sentry+ PostHog+ Uptime Robot(Free tier for Monitoring) | 0 |
| Domain+ DNS(Free tier for public repos) | 1 |
| GitHub Action CI/CD | 0 |
| TOTAL | 80-140 |


Table 11. Project's budget. Source: own elaboration

 The Stripe payment processing is planned for the future and will only incur costs when revenue is generated(Stripe, 2026).

Gaps and Risk Management Plan

Critical skills gaps were identified to impact the system development and implementation.

The developer has beginner experience with PostgreSQL advanced features which is critical to comply with functional requirements#1(users/pets tables),#3(storing extracted symptoms and RAG chunks with pgvector for vector similarity search),#5(full text search with GIN indexes).

Also limited experience with:

- FastAPI, which may impact all backend endpoints

- CSS and responsive design, which is critical to comply with system usability

- Next.js SSR/SSG patterns, Supabase Auth SDK, and pgvector extension syntax,which are essential for implementing server-side rendering, authentication flows,and semantic vector search for the RAG system.

To mitigate these gaps, time will be invested on focused learning, which will be illustrated in the timeline section. The full risk analysis is presented in Table 12.


PSEUDOCODE

The following pseudocode illustrate the the 5 most complex algorithms in the PitsyPet system, to demonstrate technical feasibility and implementation logic for critical functionalities.

Algorithm 1- User Registration and Email Activation

FUNCTION RegisterUser(email, password, name)

// Input Validation

 IF NOT IsValidEmail(email) THEN

 RETURN{status:"error", message:"Invalid email format"}

END IF

 IF password.length< 8 OR NOT ContainsUppercase(password) OR

 NOT ContainsLowercase(password) OR NOT ContainsNumber(password) OR

 NOT ContainsSpecialChar(password) THEN

 RETURN{status:"error", message:"Password must be 8+ characters with uppercase, lowercase, number, and special character"}

END IF

 IF name.length< 2 OR name.length> 100 THEN

 RETURN{status:"error", message:"Name must be 2-100 characters"}

END IF

// Call Supabase Auth API

 TRY

 response= SupabaseAuth.SignUp({

email:email,

password: password,

options:{

data:{name: name},

emailRedirectTo:'https://pitsypet.com/auth/callback'

}


\})

CATCH APIError as e

 Log.Error("Supabase Auth registration failed:"+ e.message)

RETURN{status:"error", message:"Registration failed. Please try again."}

END TRY

// Supabase Auth internally performs:

// 1. Validates email format and password strength requirements

// 2. Hashes password using bcrypt with cost factor 10

// 3. Generates unique user_id(UUID v4 format)

// 4. Creates record in auth.users table with email_confirmed_at= NULL

// 5. Generates cryptographically secure magic link token(24-hour expiry, single-use)

// 6. Sends verification email automatically via Supabase Email Service

// 7. Returns user object with metadata

IF response.error THEN

 IF response.error.message.contains("already registered") THEN

 RETURN{status:"error", message:"Account with this email already exists.Please log in."}

ELSE

 RETURN{status:"error", message: response.error.message}

END IF

 END IF

 RETURN{

status:"success",

message:"Registration successful. Check your email to confirm account.",

user_id: response.data.user.id

}

END FUNCTION

 FUNCTION ConfirmEmail(token)


// Called when user clicks magic link in verification email

TRY

 response= SupabaseAuth.VerifyOtp({

token_hash: token,

type:'email'

})

CATCH APlError as e

Log.Error("Email verification failed:"+ e.message)

RETURN{status:"error", message:"Verification failed. Please try again."}

END TRY

// Supabase Auth internally:

// 1. Validates token exists in auth.users table

// 2. Checks token hasn't expired(<24 hours since generation)

// 3. Verifies token hasn't been used previously(single-use constraint)

// 4. Updates auth.users: email_confirmed_at= current timestamp

// 5. Marks magic link token as used in database

// 6. Generates JWT access token(1 hour expiry) and refresh token(30 days expiry)

// 7. Creates authenticated session with tokens

IF response.error THEN

 IF response.error.message.contains("expired") THEN

 RETURN{status:"error", message:"Verification link expired. Please request a new one."}

ELSE IF response.error.message.contains("invalid") THEN

 RETURN{status:"error", message:"Invalid verification link. Please request a new one."}

ELSE

RETURN{status:"error", message: response.error.message}

END IF

END IF


RETURN{

status:"success",

message:"Email confirmed successfully. Redirecting to pet profile creation.",

session: response.data.session,

user: response.data.user

}

END FUNCTION

 FUNCTION ResendVerificationEmail(email)

// Called when user requests new verification email

 TRY

 response= SupabaseAuth.Resend({

type:'signup',

email:email,

options:{

emailRedirectTo:'https://pitsypet.com/auth/callback'


})

CATCH APIError as e

 Log.Error("Resend verification failed:"+e.message)

RETURN{status:"error", message:"Failed to resend email. Please try again."}

END TRY

// Supabase Auth internally:

// 1. Checks if email exists in auth.users and is unconfirmed

// 2. Generates new magic link token(invalidates previous token)

// 3. Sends new verification email automatically

 IF response.error THEN

 RETURN{status:"error", message: response.error.message}

END IF

 RETURN{status:"success", message:"Verification email sent. Check your inbox."}


END FUNCTION

// Helper Functions(unchanged from original)

FUNCTION IsValidEmail(email)

pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]\{2,\}$"

RETURN email.matches(pattern)

END FUNCTION

 FUNCTION ContainsUppercase(str)

RETURN str.matches(".*[A-Z].*")

END FUNCTION

 FUNCTION ContainsLowercase(str)

RETURN str.matches(".*[a-z].*")

END FUNCTION

 FUNCTION ContainsNumber(str)

RETURN str.matches(".*[0-9].*")

END FUNCTION

 FUNCTION ContainsSpecialChar(str)

specialChars="!@\#$\%^\&*()_+-=[]\{}|;:,.<>?"

FOR EACH char IN str DO

 IF specialChars.contains(char) THEN

 RETURN TRUE

 END IF

 END FOR

 RETURN FALSE

 END FUNCTION


Algorithm 2- Extraction of conversational symptom

FUNCTION ExtractSymptoms(userMessage, conversationHistory, petProfile)

// Build Context for Al Agent

 systemPrompt="You are a veterinary triage assistant. Your role is to extract symptom information from pet owner descriptions.

Extract: symptom name, onset time, frequency, severity indicators.

Output as JSON:{symptoms:[{name: str, onset: str, frequency: str,severity: str}]}"

conversationContext=""

FOR EACH message IN conversationHistory DO

 conversationContext+= message.role+":"+ message.content+"\n"

END FOR

 petContext="Pet Profile:"+ petProfile.species+","+ petProfile.breed+","+

petProfile.age+" years old,"+ petProfile.weight+" kg"

fullPrompt= systemPrompt+"\n\n"+ petContext+"\n\n"+ conversationContext+"\nUser:"+ userMessage

// Call Al Agent(Tier 1- Claude Sonnet)

TRY

 aiResponse= ClaudeAPI.Call(

model:"claude-sonnet-4-20250514",

messages:[

{role:"system", content: systemPrompt},

{role:"user", content: petContext+"\n\n"+ conversationContext+"\nUser:

"+ userMessage}

],

max_tokens: 500,

temperature: 0.3// Lower temperature for more consistent entity extraction



CATCH APlError as e

Log.Error("Claude API call failed:"+ e.message)

// Fallback: Simple keyword extraction

 RETURN FallbackKeywordExtraction(userMessage)

END TRY

// Parse AI Response(expecting JSON)

TRY

extractedData=JSON.Parse(aiResponse.content)

CATCH JSONParseError as e

Log.Warning("Failed to parse Al response as JSON:"+ e.message)

// Retry with explicit JSON instruction

 RETURN ExtractSymptomsRetry(userMessage, conversationHistory, petProfile)

END TRY

// Validate Extracted Entities

 validatedSymptoms=[]

FOR EACH symptom IN extractedData.symptoms DO

 IF symptom.name IS NOT NULL AND symptom.name.length> 0 THEN

// Normalize symptom name

 normalizedSymptom={

name: NormalizeSymptomName(symptom.name),

onset: symptom.onset OR"unknown",

frequency: symptom.frequency OR"unknown",

severity: symptom.severity OR"unknown",

extractedAt: CurrentDateTime()

\}

validatedSymptoms.append(normalizedSymptom)

END IF

END FOR

// Check Completeness

 isComplete= CheckSymptomCompleteness(validatedSymptoms)


// Generate Follow-Up Question

 IF isComplete THEN

 followUpQuestion="Thank you. I have enough information to assess"+petProfile.name+"'s condition. One moment while I analyze..."

ELSE

 followUpQuestion= GenerateFollowUpQuestion(validatedSymptoms,conversationHistory)

END IF

 RETURN{

extractedEntities:{symptoms: validatedSymptoms},

followUpQuestion: followUpQuestion,

isComplete: isComplete,

tokensUsed: aiResponse.usage.total_tokens

}

END FUNCTION

 FUNCTION CheckSymptomCompleteness(symptoms)

IF symptoms.length== 0 THEN

 RETURN FALSE// No symptoms extracted yet

 END IF

// Check if at least one symptom has onset information

 hasOnsetInfo= FALSE

 FOR EACH symptom IN symptoms DO

 IF symptom.onset!="unknown" THEN

 hasOnsetInfo= TRUE

 BREAK

 END IF

 END FOR


// Check if we have severity indicators for concerning symptoms

 concerningSymptoms=["vomiting","diarrhea","lethargy","difficulty breathing","seizure"]

hasSeveritylnfo= FALSE

 FOR EACH symptom IN symptoms DO

 IF concerningSymptoms.contains(symptom.name) THEN

 IF symptom.frequency  $!=$  "unknown" OR symptom.severity  $!=$  "unknown"

THEN

 hasSeveritylnfo= TRUE

 BREAK

 END IF

 END IF

 END FOR

// Require minimum 1 symptom with onset, and severity info for concerning symptoms

 RETURN hasOnsetInfo AND(hasSeveritylnfo OR symptoms.length>= 3)

END FUNCTION

 FUNCTION GenerateFollowUpQuestion(currentSymptoms, conversationHistory)

// Identify what information is missing

 missingOnset=[]

missingFrequency  $=[]$ 

FOR EACH symptom IN currentSymptoms DO

 IF symptom.onset=="unknown" THEN

 missingOnset.append(symptom.name)

END IF

 IF symptom.frequency=="unknown" AND

 IsConcerningSymptom(symptom.name) THEN

 missingFrequency.append(symptom.name)


END IF END FOR

// Prioritize: onset> frequency> additional symptoms

 IF missingOnset.length> 0 THEN

 RETURN"When did you first notice"+ missingOnset[0]+"?"

ELSE IF missingFrequency.length> 0 THEN

 RETURN"How many times has"+ petProfile.name+""+ missingFrequency[0]

+" in the last 24 hours?"

ELSE

// Ask about additional symptoms

 RETURN"Are there any other symptoms you've noticed? For example,changes in appetite, energy level, or behavior?"

END IF

END FUNCTION

 FUNCTION NormalizeSymptomName(symptomName)

// Convert to lowercase, remove extra spaces

 normalized= symptomName.toLowerCase().trim()

// Synonym mapping

 synonyms={

"throwing up":"vomiting",

"puking":"vomiting",

"loose stool":"diarrhea",

"runny poop":"diarrhea",

"tired":"lethargy",

"sleepy":"lethargy",

"not eating":"loss of appetite",

"won't eat":"loss of appetite"

\}


IF synonyms.containsKey(normalized) THEN

 RETURN synonyms[normalized]

ELSE

 RETURN normalized

 END IF

 END FUNCTION

 FUNCTION IsConcerningSymptom(symptomName)

concerningSymptoms=["vomiting","diarrhea","lethargy","difficulty breathing",

"seizure","bleeding","unresponsive","collapse"]

RETURN concerningSymptoms.contains(symptomName)

END FUNCTION

// Fallback: Rule-based keyword extraction if Al fails

 FUNCTION FallbackKeywordExtraction(userMessage)

symptoms=[]

message= userMessage.toLowerCase()

// Simple keyword matching

 IF message.contains("vomit") OR message.contains("throw") THEN

 symptoms.append({name:"vomiting", onset:"unknown", frequency:"unknown",severity:"unknown"})

END IF

 IF message.contains("diarrhea") OR message.contains("loose stool") THEN

 symptoms.append({name:"diarrhea", onset:"unknown", frequency:"unknown",severity:"unknown"})

END IF

 IF message.contains("lethargic") OR message.contains("tired") OR message.contains("weak") THEN


symptoms.append({name:"lethargy", onset:"unknown", frequency:"unknown",severity:"unknown"})

END IF

// Extract time references(simple patterns)

IF message.contains("yesterday") THEN

 FOR EACH symptom IN symptoms DO

 symptom.onset="24 hours ago"

END FOR

 ELSE IF message.contains("this morning") THEN

 FOR EACH symptom IN symptoms DO

 symptom.onset="this morning"

END FOR

 END IF

 RETURN{

extractedEntities:{symptoms: symptoms},

followUpQuestion:"Can you tell me more about the symptoms?",

isComplete: FALSE,

fallbackUsed: TRUE

\}

END FUNCTION

Algorithm 3- RAG knowledge retrieval

 FUNCTION RetrieveKnowledge(symptoms, petProfile, top  $K=5$  )

// Build search query from symptoms and pet characteristics

 symptomNames=[]

FOR EACH symptom IN symptoms DO

 symptomNames.append(symptom.name)

END FOR


// Construct semantic search query

 searchQuery= petProfile.species+""+ symptomNames.join("")+""+petProfile.breed

// Example:"Dog vomiting lethargy loss of appetite Golden Retriever"

Log.Info("RAG search query:"+ searchQuery)

// Generate embedding vector for query using OpenAl TRY

 embeddingResponse= OpenAIEmbeddingAPI.Call(

model:"text-embedding-3-large",// 1536 dimensions

 input: searchQuery

)

CATCH APIError as e

 Log.Error("OpenAl embedding generation failed:"+ e.message)

RETURN{status:"error", message:"Unable to generate search embedding",chunks:[]}

END TRY

 queryEmbedding= embeddingResponse.data[0].embedding// Array of 1536 floats

// Execute pgvector similarity search in Supabase PostgreSQL

 sqlQuery="

SELECT

 chunk_id,

text,

metadata,

embedding<=>$1::vector AS distance

 FROM veterinary_knowledge

 WHERE species=$2

AND urgency_level>= 5

ORDER BY embedding<=>$1::vector

 LIMIT$3


// The<=> operator computes cosine distance  $(0=$  identical,  $2=$  opposite)

// Other pgvector operators:

//<->: L2 distance(Euclidean)

//<\#>: Inner product(negative dot product)

TRY

results= Database.Query(sqlQuery,[

queryEmbedding,//$1: vector(1536)

petProfile.species,//$2: text('Dog' or'Cat')

topK//$3: integer(default 5)

])

CATCH DatabaseError as e

 Log.Error("pgvector search failed:"+ e.message)

RETURN{status:"error", message:"Knowledge retrieval failed", chunks:[]}

END TRY

// Process results and filter by distance threshold

 knowledgeChunks=[]

FOR EACH result IN results DO

// Cosine distance<0.7 indicates good semantic similarity

//(cosine similarity>0.3)

IF result.distance  $<=0.7$  THEN

 chunk={

chunk_id: result.chunk_id,

text: result.text,

source: result.metadata.source,

urgency_level: result.metadata.urgency_level,

body_system: result.metadata.body_system,

breed_specific: result.metadata.breed_specific,

distance: result.distance,

relevance_score: 1- result.distance// Convert distance to similarity(0-1)




END IF

 END FOR

// Ensure source diversity(max 2 chunks from same source)diverseChunks= EnsureSourceDiversity(knowledgeChunks, maxPerSource: 2)

Log.Info("Retrieved"+ diverseChunks.length+" relevant knowledge chunks")

RETURN{

status:"success",

chunks: diverseChunks,

queryUsed: searchQuery,

totalResults: results.length

}

END FUNCTION

FUNCTION EnsureSourceDiversity(chunks, maxPerSource)

// Prevent all chunks coming from single source document

 sourceCount=\{\}// Map: source-> count

 diverseChunks=[]

FOR EACH chunk IN chunks DO

source= chunk.source

 currentCount= sourceCount.get(source, default: 0)

IF currentCount< maxPerSource THEN

 diverseChunks.append(chunk)

sourceCount[source]= currentCount+1

END IF

// Stop when we have enough diverse chunks

IF diverseChunks.length>= 5 THEN

 BREAK

 END IF

 END FOR

 RETURN diverseChunks

 END FUNCTION

// Function to curate and upload knowledge base(run once during setup)

FUNCTION CurateKnowledgeBase()

// Load veterinary guidelines from authoritative sources

 sources=[

{file:"rspca_dog_symptoms.txt", source:"RSPCA Australia", species:"Dog"},

{file:"rspca_cat_symptoms.txt", source:"RSPCA Australia", species:"Cat"},

{file:"ava_triage_protocols.txt", source:"Australian Veterinary Association",species:"Both"},

{file:"vca_emergency_guide.txt", source:"VCA Animal Hospitals", species:"Both"}

]

allChunks=[]

FOR EACH source IN sources DO

// Read file content

 content= ReadFile(source.file)

// Split into chunks(300-500 tokens each with 50 token overlap)

chunks=SplitIntoChunks(content, chunkSize: 400, overlap: 50)

FOR EACH chunkText IN chunks DO

// Classify urgency level(1-10) based on content

 urgencyLevel= ClassifyUrgencyLevel(chunkText)

// Identify body system


bodySystem= IdentifyBodySystem(chunkText)

// Generate embedding using OpenAI

 embeddingResponse= OpenAIEmbeddingAPI.Call(

model:"text-embedding-3-large",

input: chunkText


 embedding= embeddingResponse.data[0].embedding// 1536 dimensions

// Create chunk record for database

 chunk={

chunk_id: GenerateUUID(),

text: chunkText,

embedding: embedding,

metadata:{

source: source.source,

species: source.species,

urgency_level: urgencyLevel,

body_system: bodySystem

\}

source: source.source,

species: source.species,

urgency_level: urgencyLevel,

created_at: CurrentTimestamp(),

updated_at: CurrentTimestamp()

}

allChunks.append(chunk)

END FOR

 END FOR

// Insert all chunks into Supabase PostgreSQL with pgvector sqllnsert="


INSERT INTO veterinary_knowledge

(chunk_id, text, embedding, metadata, source, species, urgency_level,created_at, updated_at)

VALUES($1,$2,$3::vector,$4,$5,$6,$7,$8,$9)

FOR EACH chunk IN allChunks DO

 Database.Execute(sqllnsert,[

chunk.chunk_id,

chunk.text,

chunk.embedding,// Automatically converted to vector(1536)

JSON.Stringify(chunk.metadata),

chunk.source,

chunk.species,

chunk.urgency_level,

chunk.created_at,

chunk.updated_at

])

END FOR

// Create IVFFlat index for fast approximate nearest neighbor search indexSQL="

CREATE INDEX IF NOT EXISTS idx_veterinary_knowledge_embedding

 ON veterinary_knowledge

 USING ivfflat(embedding vector_cosine_ops)

WITH(lists= 100)


Database.Execute(indexSQL)

Log.Info("Uploaded"+ allChunks.length+" knowledge chunks to Supabase PostgreSQL with pgvector")

Log.Info("Created IVFFlat index with 100 lists(optimal for 2K-10K chunks)")

END FUNCTION


FUNCTION ClassifyUrgencyLevel(text)

// Rule-based urgency classification

 text= text.toLowerCase()

// High urgency keywords(8-10)

IF text.contains("emergency") OR text.contains("immediate") OR text.contains("life-threatening") OR text.contains("critical") THEN RETURN 9

END IF

// Moderate-high urgency(6-7)

IF text.contains("urgent") OR text.contains("veterinary attention") OR text.contains("should see a vet") THEN

 RETURN 7

END IF

// Moderate urgency(4-5)

IF text.contains("monitor") OR text.contains("concerning") THEN

 RETURN 5

END IF

// Low urgency(1-3)

RETURN 3

END FUNCTION

 FUNCTION IdentifyBodySystem(text)

text= text.toLowerCase()

IF text.contains("vomit") OR text.contains("diarrhea") OR text.contains("stomach")THEN

 RETURN"gastrointestinal"


ELSE IF text.contains("breathing") OR text.contains("cough") OR text.contains("respiratory") THEN

 RETURN"respiratory"

ELSE IF text.contains("skin") OR text.contains("rash") OR text.contains("itch")THEN

 RETURN"dermatological"

ELSE IF text.contains("kidney") OR text.contains("urinary") OR text.contains("bladder") THEN

 RETURN"urinary"

ELSE

 RETURN"general"

END IF

 END FUNCTION

Algorithm 4- Al Risk Classification

 FUNCTION ClassifyRisk(symptoms, petProfile, knowledgeChunks)

// Build Structured Prompt for Al

 systemPrompt="You are a veterinary triage Al assistant. Analyze the following pet symptoms and classify the risk level as Low, Medium, or High based on veterinary guidelines.

Risk Definitions:

- Low Risk: Minor symptoms, home monitoring appropriate, no immediate vet needed

- Medium Risk: Concerning symptoms, vet appointment within 24 hours recommended

- High Risk: Severe/life-threatening symptoms, immediate veterinary care required

 Respond in JSON format:

{

'risk_level':'Low'|'Medium'|'High',


'confidence_score': 0.0-1.0,

'clinical_reasoning':'detailed explanation',

'recommended_action':'what owner should do',

'red_flags':['flag1','flag2'](if High risk)

\}"

// Format Symptoms for Prompt

 symptomSummary="Symptoms observed:\n"

FOR EACH symptom IN symptoms DO

 symptomSummary+="-"+ symptom.name

 IF symptom.onset  $!=$  "unknown" THEN

 symptomSummary  $+="$  (onset:"+ symptom.onset+")"

END IF

 IF symptom.frequency  $!=$  "unknown" THEN

 symptomSummary  $+="$  (frequency:"+ symptom.frequency  $+"$  )"

END IF

 symptomSummary  $+="\backslash n"$ 

END FOR

// Format Pet Profile

 petSummary="Pet:"+ petProfile.species+"("+ petProfile.breed+"),"+

petProfile.age+" years old,"+ petProfile.weight+" kg"

IF petProfile.medical_conditions.length> 0 THEN

 petSummary+="\nPre-existing conditions:"+

petProfile.medical_conditions.join(",")

END IF

// Format Retrieved Knowledge

 knowledgeContext="Relevant veterinary guidelines:\n"

FOR EACH chunk IN knowledgeChunks DO

 knowledgeContext+="Source:"+ chunk.source+"(urgency:"+chunk.urgency_level+"/10)\n"


knowledgeContext+= chunk.text+"\n\n"

END FOR

// Construct Full Prompt

 userPrompt= petSummary+"\n\n"+ symptomSummary+"\n\n"+

knowledgeContext

// Call Claude API(Tier 3)

TRY

 aiResponse= ClaudeAPI.Call(

model:"claude-sonnet-4-20250514",

messages:[

{role:"system", content: systemPrompt},

{role:"user", content: userPrompt}

],

max_tokens: 800,

temperature: 0.2// Low temperature for consistent medical reasoning


 CATCH APlError as e

 Log.Error("Claude API classification failed:"+ e.message)

// Fallback to rule-based classification

 RETURN FallbackRuleBasedClassification(symptoms, petProfile)

END TRY

// Parse Al Response

 TRY

// Remove```json``` wrappers if present

 cleanedResponse= aiResponse.content.replace("'''json",'''').replace('''''''''

"").trim()

classification= JSON.Parse(cleanedResponse)

CATCH JSONParseError as e

 Log.Error("Failed to parse Al classification:"+ e.message)

RETURN FallbackRuleBasedClassification(symptoms, petProfile)


END TRY

// Validate Classification

 validRiskLevels=["Low","Medium","High"]

IF NOT validRiskLevels.contains(classification.risk_level) THEN

 Log.Warning("Invalid risk level:"+ classification.risk_level)

classification.risk_level="Medium"// Default to Medium for safety

 classification.confidence_score= 0.60

END IF

IF classification.confidence_score< 0.0 OR classification.confidence_score> 1.0

THEN

Log.Warning("Invalid confidence score:"+ classification.confidence_score)

classification.confidence_score= 0.75// Default mid-range confidence

END IF

// Confidence Threshold Check

 IF classification.confidence_score< 0.75 THEN

 Log.Info("Low confidence classification("+ classification.confidence_score+"),requesting more information")

RETURN{

status:"insufficient_information",

message:"I need more details to provide an accurate assessment. Can you tell me more about[specific detail]?",

current_classification: classification,

confidence_score: classification.confidence_score

\}

END IF

// Safety Override: Critical Symptoms Always High Risk

 criticalSymptoms=["seizure","difficulty breathing","unresponsive","bleeding profusely","collapse"]

FOR EACH symptom IN symptoms DO


IF criticalSymptoms.contains(symptom.name) THEN

 IF classification.risk_level!="High" THEN

 Log.Warning("Safety override: Critical symptom detected, escalating to

 High risk")

classification.risk_level="High"

classification.clinical_reasoning+="[Note: Critical symptom detected-automatic escalation to High risk]"

END IF

 BREAK

 END IF

 END FOR

// Log Classification for Monitoring

 Log.Info("Risk classification:"+ classification.risk_level+

"(confidence:"+ classification.confidence_score+")")

RETURN{

status:"success",

risk_level: classification.risk_level,

confidence_score: classification.confidence_score,

clinical_reasoning: classification.clinical_reasoning,

recommended_action: classification.recommended_action,

red_flags: classification.red_flags OR[],

tokens_used: aiResponse.usage.total_tokens

}

END FUNCTION

// Fallback: Rule-based classification if Al unavailable

 FUNCTION FallbackRuleBasedClassification(symptoms, petProfile)

// Severity scoring system

 severityScore= 0


// Symptom severity points

 symptomScores={

"vomiting": 2,

"diarrhea": 2,

"lethargy": 3,

"loss of appetite": 2,

"difficulty breathing": 8,

"seizure": 10,

"bleeding":7,

"unresponsive": 10,

"collapse": 10,

"pain": 4,

"limping":2,

"coughing": 2,

"sneezing": 1


FOR EACH symptom IN symptoms DO

 IF symptomScores.containsKey(symptom.name) THEN

 severityScore+= symptomScores[symptom.name]

ELSE

 severityScore+= 1// Unknown symptom, add minimal points

 END IF

 END FOR

// Frequency multiplier

 FOR EACH symptom IN symptoms DO

 IF symptom.frequency.contains("multiple") OR

 symptom.frequency.contains(">5") THEN

 severityScore+= 2// Frequent occurrence increases severity

 END IF

 END FOR


// Age/weight risk factors

 IF petProfile.age< 1 OR petProfile.age> 12 THEN

 severityScore+= 1// Very young or senior pets more vulnerable

 END IF

// Classify based on score

 IF severityScore>= 10 THEN

 riskLevel="High"

recommendedAction="Seek immediate veterinary care"

reasoning="Multiple severe symptoms detected. Risk score:"+ severityScore ELSE IF severityScore>= 5 THEN

 riskLevel="Medium"

recommendedAction="Schedule veterinary appointment within 24 hours"

reasoning="Concerning symptoms detected. Risk score:"+ severityScore

 ELSE

 riskLevel="Low"

recommendedAction="Monitor at home, contact vet if symptoms worsen"

reasoning="Mild symptoms detected. Risk score:"+ severityScore

 END IF

 RETURN{

status:"success",

risk_level: riskLevel,

confidence_score: 0.65,// Lower confidence for rule-based

 clinical_reasoning: reasoning+"[Note: Rule-based fallback classification- Al unavailable]"

recommended_action: recommendedAction,

fallback_used: TRUE

}

END FUNCTION


Algorithm 5- Full-text search with GIN Index

FUNCTION SearchAssessmentHistory(searchQuery, userld, limit= 50)

// Input Validation

 IF searchQuery.length== 0 THEN

 RETURN{status:"error", message:"Search query cannot be empty"}

END IF

 IF searchQuery.length> 500 THEN

 searchQuery= searchQuery.substring(0, 500)// Truncate excessive queries

 Log.Warning("Search query truncated to 500 characters")

END IF

// Sanitize Query(prevent SQL injection)

sanitizedQuery= SanitizeInput(searchQuery)

// Build PostgreSQL Full-Text Search Query

 sqlQuery="

SELECT

 assessment_id,

pet_name,

risk_classification,

primary_concern,

created_at,

ts_rank(

to_tsvector('english', clinical_reasoning||''|| extracted_symptoms::text||'

'|| primary_concern),

plainto_tsquery('english',$1)

)AS relevance_score

 FROM Assessments

 WHERE user_id=$2

AND user_saved= TRUE

 AND(


to_tsvector('english', clinical_reasoning||''|| extracted_symptoms::text||''|| primary_concern)

![](images/7595cdb5015b073f3ef0a49c14697ae7-image.png)@@ plainto_tsquery('english',$1)

OR primary_concern ILIKE'\%'||$1||'\%'

OR pet_name ILIKE'\%'||$1||'\%'

)

ORDER BY relevance_score DESC, created_at DESC ORDER BY relevance_score DESC, created_at DESC

 LIMIT$3

// Execute Query with Parameterized Inputs(prevents SQL injection)

TRY

 startTime= CurrentTime()

results= Database.Query(sqlQuery,[sanitizedQuery, userld, limit])

queryTime= CurrentTime()- startTime

 Log.Info("Search query"'+ searchQuery+" returned"+ results.length+"results in"+ queryTime+"ms")

// Performance check(should be<200ms per NFR-02)

IF queryTime> 200 THEN

 Log.Warning("Search query slow("+ queryTime+"ms), consider index optimization")

END IF

 CATCH DatabaseError as e

 Log.Error("Search query failed:"+ e.message)

RETURN{status:"error", message:"Search failed. Please try again."}

END TRY

// Format Results

 formattedResults=[]

FOR EACH row IN results DO


// Parse extracted_symptoms from JSONB symptoms= JSON.Parse(row.extracted_symptoms)symptomNames=[]

FOR EACH symptom IN symptoms DO symptomNames.append(symptom.name)END FOR

 result={

assessment_id: row.assessment_id,

pet_name: row.pet_name,

risk_level: row.risk_classification,

primary_concern: row.primary_concern,

symptoms: symptomNames,

date: row.created_at,

relevance_score: row.relevance_score

\}

formattedResults.append(result)

END FOR

 RETURN{

status:"success",

results: formattedResults,

total_results: formattedResults.length,

query_time_ms: queryTime

}

END FUNCTION

// Create GIN Index(run once during database setup)

FUNCTION CreateSearchIndex()

indexSQL="

CREATE INDEX idx_assessments_fulltext_search

 ON Assessments


USING GIN(

to_tsvector('english',

clinical_reasoning||''||

primary_concern||''||

extracted_symptoms::text



 TRY

 Database.Execute(indexSQL)

Log.Info("GIN index created successfully on Assessments table")

CATCH DatabaseError as e

 Log.Error("Failed to create GIN index:"+ e.message)

END TRY

 END FUNCTION

 FUNCTION SanitizeInput(input)

// Remove potentially dangerous SQL characters

// Note: Parameterized queries($1,$2) already prevent injection,

// but sanitization adds defense-in-depth

// Remove SQL comment markers

 sanitized=input.replace("--","").replace("/*","").replace("*/","")

// Remove SQL statement terminators

 sanitized= sanitized.replace(";","")

// Remove quotes(parameterized query handles these safely anyway)

sanitized= sanitized.replace(""","").replace(""","")

// Trim whitespace


$$\text{ sanitized}=\text{ sanitized.trim()}$$

RETURN sanitized

 END FUNCTION

UI/UX DESIGN

 The user interface and user experience of PitsyPet ensures accessibility and responsive design for an intuitive experience during stressful and concerning scenarios related to pets' health. The system will include Landing Page, Registration Page, Email Verification, Login Page, Pet Profile Creation, Dashboard(navigation hub/pet selection), Symptom Assessment(chat interface), Results Page,Assessment History and Assessment Detail. Fig. 4 to 13 show the critical wireframes for the project developed on Figma to enhance UX

Dashboard

![[Pasted image 20260524130349.png]]
Fig. 4. PitsyPet’s main Dashboard with pet profiles added (desktop version)

![[Pasted image 20260524130416.png]]
Fig. 5. PitsyPet's main Dashboard without pet profiles added(desktop version)

Registration page
![[Pasted image 20260524130529.png]]
Fig. 6. PitsyPet’s Registration Page. Source: own elaboration

![[Pasted image 20260524130625.png]]
Fig. 7 and 8. Examples of password and email verification Source: own elaboration



![[Pasted image 20260524130647.png]]

Fig. 9. Example of a successful registration Source: own elaboration

Pet Profile Creation

![[Pasted image 20260524130733.png]]

Fig. 9. Pet Profile Creation in PitsyPet system Source: own elaboration

Symptom Assessment Chat

![[Pasted image 20260524130801.png]]

Fig. 10. AI-powered Assessment Chat. Source: own elaboration

Results Pages

![[Pasted image 20260524130828.png]]

Fig. 11-12. High-Risk and Medium-Risk Results Pages. Source: own elaboration

![[Pasted image 20260524130848.png]]

Fig. 13. Low-Risk Results Page. Source: own elaboration

Assessment History

![[Pasted image 20260524130920.png]]

Fig. 13. Assessment Search Page. Source: own elaboration




TIMELINE

The project aims to deliver a complete MVP, developed over a 25 week period, from February 9th to July 31st. This period covers the required skills learning to close critical gaps, active development of the Al-powered triage system, implementation and testing of integrated features. The last weeks are reserved for final report writing and documentation of lessons learned. A detailed timeline is provided in the Gantt Chart(Fig 14-18).


CONCLUSION

This Capstone project proposal introduces PitsyPet, an Al-powered veterinary triage system designed to address a genuine gap in the pet healthcare industry. By employing advanced artificial intelligence through the Claude Sonnet 4.5 API,Retrieval-Augmented Generation(RAG) architecture with Supabase PostgreSQL and pgvector extension, and conversational natural language processing, PitsyPet helps pet owners make informed decisions when their pets first show symptoms. The system delivers rapid, personalised risk assessments(Low, Medium, High) with clinical reasoning and actionable guidance, reducing unnecessary emergency visits while ensuring timely veterinary care for more serious conditions. The project generates social impact by reducing the burden on veterinary emergency services,allowing them to focus on critical cases; empowering pet owners to make informed decisions and alleviating anxiety when symptoms arise; and supporting rural communities where access to veterinary services may be limited.

The project illustrates technical innovation through AI system training and RAG Architecture, while demonstrating knowledge in database systems, web development and software engineering. At the same time, the project provides further significant skill development across AI/ML integration and prompt engineering, full-stack web development, database optimisation, experience in cloud infrastructure, and industry best practices through comprehensive testing, security implementation, accessibility compliance, and regulatory compliance as the foundation to understand and navigate similar regulatory frameworks in other countries.

The comprehensive plan documented in this proposal demonstrates readiness to execute the 25 week development timeline. The journey from proposal to final delivery will present anticipated challenges such as technical complexity, skill gaps,and lack of collaborative learning, since all the work will be developed individually.However, the risk mitigation framework provides the structure to manage challenges,and the result will be a deployable minimum viable product showcasing professional software engineering capabilities.


Beyond individual academic achievement, PitsyPet contributes to the emerging field of Al-powered healthcare decision support. The project demonstrates responsible Al development by acknowledging uncertainty with confidence scores, establishing safety protocols for critical decisions, and clearly communicating system limitations through clear legal disclaimers to users.

PitsyPet represents foundation for potential post-graduation startup. The technical architecture supports scalability to millions of users, the business model supports expansion to global markets, and the mission supports meaningful work towards improving pet and owner wellbeing. Future enhancements include Stripe integration for subscription payment processing, enabling the freemium business model with premium features, real-time video consultations with licensed veterinarians, and veterinary clinic partnerships to create a comprehensive pet healthcare system.


REFERENCES

Animal Medicines Australia(AMA)(2025). Pets in Australia: A national survey of pets and people. Retrieved from: https://animalmedicinesaustralia.org.au/wp-content/uploads/2025/09/SNR-2403006-Pet-Ownership-Study-2025-Designed_F3.pdf Cosgrove, N. 13 Surprising Australian Pet Spending Statistics to Know in 2026.Retrieved from: https://www.dogster.com/statistics/pet-spending-statistics-australia?utm_source=chatgpt.com

 Anthropic(2025). Claude Coding Tool. https://www.anthropic.com/

Australian Veterinary Association(AVA)(2026).https://www.ava.com.au/

Cosgrove, N.(2026). 13 Surprising Australian Pet Spending Statistics to Know in 2026. Retrieved from: https://www.dogster.com/statistics/pet-spending-statistics-australia

 Fadlallah, H(2022). Using parameterized queries to avoid SQL injection. Retrieved from:https://www.sqlshack.com/using-parameterized-queries-to-avoid-sql-injection/

FastAPI(2026).API Framework Tool.https://fastapi.tiangolo.com/

Figma(2026). Design tool. www.figma.com

 FirstVet. Online Vet Clinic. https://firstvet.com/uk

 Fortin-Choquette R, Coe JB, Bauman CA, Teller LM."It's Like Having a Map": An Exploration of Participating Pet Owners' Expectations of Using Telemedicine to Access Emergency Veterinary Care. Vet Sci. 2025 May 12;12(5):460. Retrieved from:https://pmc.ncbi.nlm.nih.gov/articles/PMC12115819/?utm_source=chatgpt.com

 Huda, M(2024). PostgreSQL Full-Text Search: A Powerful Alternative to Elastic search for Small to Medium Applications. Retrieved from:https://


iniakunhuda.medium.com/postgresql-full-text-search-a-powerful-alternative-to-elasticsearch-for-small-to-medium-d9524e001fe0

IBM Technology.[IBM Technology].(2024, October, 28). What is Agentic RAG?[Video]. YouTube. https://youtu.be/0z9_MhcYvcY?si=w0Jwx-6DI1msS8tZ

 IBM Technology.[IBM Technology].(2025, April, 14). RAG vs Fine-Tuning vs Prompt Engineering: Optimizing Al Models.[Video]. YouTube. https://www.youtube.com/watch?v=zYGDpG-pTho

 Joii Pet Care(2026).https://www.joiipetcare.com/

KenResearch(2024). Australia Animal Health and Veterinary Services Market Report. Retrieved from: https://www.kenresearch.com/australia-animal-health-and-veterinary-services-market?utm_source=chatgpt.com

 KodeKloud.[KodeKloud].(2025, August, 14). RAG Explained For Beginners.[Video].YouTube.https://www.youtube.com/watch?v=_HQ2H_0Ayy0

Kogan LR, Hazel SJ, Oxley JA. A pilot study of Australian pet owners who engage in social media and their use, experience and views of online pet health information.Aust Vet J. 2019 Nov;97(11):433-439.Retrieved from: https://pubmed.ncbi.nlm.nih.gov/31418853/

Next.js(2026). Next.js 14 Documentation.https://nextjs.org/docs

 OpenAI(2026). Embeddings API Documentation. Retrieved from: https://platform.openai.com/docs/guides/embeddings

 OpenAI(2026). Structured model outputs. Retrieved from: https://platform.openai.com/docs/guides/structured-outputs

 PetCloud(2025). Vet Prices in Australia(2025): Typical Costs and How to Save.Retrieved from: https://www.petcloud.com.au/d/blog/vet-prices-in-australia-2025-


typical-costs-how-to-save/

PetMD Symptom Checker(2026).https://www.petmd.com/symptom-checker

 pgvector(2026). pgvector: Open-source vector similarity search for Postgres.Retrieved from: https://github.com/pgvector/pgvector

 PlantUML(2026).UML Web Editor Tool.https://www.plantuml.com

 Postgresql(2026). GIN Indexes Documentation. Retrieved from: https://www.postgresql.org/docs/current/gin.html

 Postgresql(2026). PostgreSQL 15.3. Retrieved from: https://www.postgresql.org/docs/release/15.3/

PostHog(2026). PostHog Product Analytics Documentation. https://posthog.com/docs

 Postman(2026).API Management Tool.https://www.postman.com/

Python(2026). Python 3.11.0. Retrieved from: https://www.python.org/downloads/release/python-3110/

Railway(2026). Railway Deployment Platform Documentation. https://docs.railway.app/

RSPCA(2026). Pet Health Resources.https://www.rspca.org.au/

Sentry(2026). Sentry Error Tracking Documentation. https://docs.sentry.io/

Stonebraker, M.[Fireship].(2023, July, 28). PostgreSQL in 100 Seconds.[Video].

YouTube.https://www.youtube.com/watch?v=n2Fluyr3lbc

 Stripe(2026). Stripe Payment Processing Documentation. https://stripe.com/docs


Supabase(2026). Supabase Documentation. https://supabase.com/docs

 Supabase(2026). Supabase Auth Documentation. https://supabase.com/docs/guides/auth

 Supabase(2026). Vector columns with pgvector. https://supabase.com/docs/guides/ai/vector-columns

 Tailwind CSS(2026). Tailwind CSS Framework Documentation. https://tailwindcss.com/

Topol, E.J. High-performance medicine: the convergence of human and artificial intelligence. Nat Med 25, 44-56(2019). https://doi.org/10.1038/s41591-018-0300-7

Trello(2026).Task Management Tool.https://trello.com/

UptimeRobot(2026). UptimeRobot Monitoring Service. https://uptimerobot.com/

Vercel(2026). Vercel Deployment Platform Documentation. https://vercel.com/docs

 VetStreet. Pet Care and Health Resource. https://www.vetstreet.com/

VSC(Visual Studio Code). Open Source Al Code Editor. https://code.visualstudio.com/

Woodlock, D.[Don Woodlock].(2024, January, 19). What is RAG?[Video]. YouTube.

https://youtu.be/u47GtXwePms?si=cQxxPre8Sn6Vjp73


