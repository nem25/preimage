# preimage-server

## Basic usage (graphql)

### Public decryption mode

1. Encrypt some data using the `encryptData` query.

```graphql
query encryptData($owner:String!,$data:String!,$price:Int!){
  encryptData(owner:$owner,data:$data,price:$price) {
    data
  }
}
```

```js
{
  "owner": "039cba7bb1ae8569684997ad7f48fff021fe90fe573bcec35079f32ef69583962c",
  "data": "Hello world",
  "price": 1234
}
```

2. Fetch the resulting encrypted `data` and give it to the `decryptEncryptDataPayment` query.

```graphql
query decryptEncryptDataPayment($encryptedData:String!){
  decryptEncryptDataPayment(encryptedData:$encryptedData) {
    paymentRequest
    preimageHash
    data
  }
}
```

```js
{
  "encryptedData": "5ULUr5LbcANphMs="
}
```

3. Subscribe to invoices paying to the `preimageHash` that was just generated.

```graphql
subscription decryptionKey($keyHash:String!) {
  decryptionKey(keyHash:$keyHash) {
    key
  }
}
```

```js
{
  "keyHash": "7bb8c9e55dd9dd9d51714fd062da5edc0f16f7028a544f3964ff316ecb6bb26b"
}
```

4. Serve the `paymentRequest` from step 2 to the payer, and once it's settled, you'll receive a `key` on the `decryptionKeys` subscription. You can use it to decrypt the data client-side.

```graphql
query decryptData($key:String!,$data:String!){
  decryptData(key:$key,data:$data) {
    data
  }
}
```

```js
{
  "key": "6cf6c01f819dd8e244334303bb142f0f2fc79fe698cc62503ced389fae8c7290",
  "data": "18F6ANBkczxZWzB7LxXz13BDB17CUzgFVRGxjD0="
}
```

### Private decryption mode

1. Use the `encryptDataPayment` query directly to provide the data, owner and price.

```graphql
query encryptDataPayment($owner:String!,$data:String!,$price:Int!){
  encryptDataPayment(owner:$owner,data:$data,price:$price) {
    data
  }
}
```

```js
{
  "owner": "039cba7bb1ae8569684997ad7f48fff021fe90fe573bcec35079f32ef69583962c",
  "data": "Hello world",
  "price": 1234
}
```

2. Follow the steps 3 and 4 from "Public decryption mode" but server-side.
