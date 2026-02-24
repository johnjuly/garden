---
created: "2026-01-06"
---

- 例子

```c hello.c
#include<stdio.h>
#include<stdlib.h>

int main()
{
#pragma omp parallel
{
	puts("Hello");
	puts("World");
}
	exit(0);
}
```

`make hello`
`./hello`

- 写Makefile

```
CFLAGS+=-Wall -fopenmp
```

`make hello`

- 自动检测有多少cpu,有多少开多少线程
  ![[Pasted image 20260206101654.png]]
