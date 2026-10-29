# Postman testing

Import `Sanjula_Product_Ordering_APIs.postman_collection.json` into Postman.

Before running, edit the collection variables:

- `iamUsername`: an existing ACTIVE IAM username
- `iamPassword`: that IAM user's password
- `telephoneNo` and `subscriberID`: a number the IAM user is entitled to access
- `productBaseUrl`: defaults to `http://localhost:3009`
- `iamBaseUrl`: defaults to `http://localhost:3001`

The IAM user must either use the tested telephone number as its username or have a privileged role such as `SERVICE`, `ADMIN`, `CSR`, `SUPPORT`, or `SYSTEM`.

Start MongoDB, IAM, and Product Ordering. Then use **Run collection** and keep the request order unchanged. The first request gets a new JWT from IAM and saves it as `accessToken`. A141 saves `lteRef`, which A142 and A143 reuse automatically.

The collection does not contain a password or a pre-generated JWT. Do not export and share the collection after saving secret values into it.
