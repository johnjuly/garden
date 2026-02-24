---
created: "2026-01-29"
---

- a Reassembler :
  - receive substrings(consisting of a string of bytes & the index of the first byte of that string within the larger stream)

## Reassember 内部 存储什么？

the insert method 告诉 the Reassembler about

- a new excerpt(摘录) of the ByteStream,
- the index of the beginning of the substring, where it fits in the overall stream
