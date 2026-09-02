---
created: 2026-01-26
tags:
  - cs/安全
type: course-note
---

## entropy

> useful when determing the strength of a password

衡量密码的随机性
log (# possibilities)

## hash function

> variable data to fixed output

sha1(bytes)->160 bits

- ramdom,hard to reverse
- `printf 'hello'|sha1sum `  
  16进制40位
- 加盐 存储用户密码时。 存储的是盐+哈希

### property

- non-invertible
- collsion resistent,意味着hard to find input that produce the same output

### 使用

- git commit object
- a short summary of a file,证明 文件没有被修改
- commitment scheme？

## key derivation function(KDF)

- pbkdf2( )password based....
  - slow.因为？ 密码验证。有人想要暴力破解密码

## symmetric key cryptography

### api

- keygen()->key
- encrypt(plaintext,key) -> ciphertext
- decrypt(ciphertext,key) -> plaintext

### properties

- given ciphertext, can not figure out plaintext without key
- D(E(m,k),k)=m
- 这里的key 高熵。aes 256

### use

- 将文件上传到云端的情景 。不相信云端服务。 在本地先加密。上传密文而不是明文。
- pass phrase 通过kdf变为key ，然后 key和明文combine加密

## Asymmentry key cryptagraphy

### api

- keygen()-> ( public key,private key)
- encrpt（p,public key） -> c
- decrpt(c,privatekey) -> p

### sign

sign(message,**private** key) -> signature
verify(message, signature,public key) -> ok?

- property:
  - hard to forge 伪造 without a private key
  - correc

### use

- 加密的电子邮件。PGP
- private message application.自动 公钥 私钥 。
- 签署软件包
- git log ,git tag
