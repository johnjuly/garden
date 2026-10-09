---
created: 2026-10-02
tags:
type: note
---
- kernel/memlayout.h, which captures the layout of memory.
- kernel/vm.c, which contains most virtual memory (VM) code.
- kernel/kalloc.c, which contains code for allocating and freeing physical memory.


##  Inspect a user-process page table


make qemu; `./pgtbltest`

```sh
$  ./pgtbltest
print_pgtbl starting
va 0x0 pte 0x21FC885B pa 0x87F22000 perm 0x5B
va 0x1000 pte 0x21FC7C5B pa 0x87F1F000 perm 0x5B
va 0x2000 pte 0x21FC7817 pa 0x87F1E000 perm 0x17
va 0x3000 pte 0x21FC7407 pa 0x87F1D000 perm 0x7
va 0x4000 pte 0x21FC70D7 pa 0x87F1C000 perm 0xD7
va 0x5000 pte 0x0 pa 0x0 perm 0x0
va 0x6000 pte 0x0 pa 0x0 perm 0x0
va 0x7000 pte 0x0 pa 0x0 perm 0x0
va 0x8000 pte 0x0 pa 0x0 perm 0x0
va 0x9000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFF6000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFF7000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFF8000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFF9000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFFA000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFFB000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFFC000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFFD000 pte 0x0 pa 0x0 perm 0x0
va 0x3FFFFFE000 pte 0x21FD08C7 pa 0x87F42000 perm 0xC7
va 0x3FFFFFF000 pte 0x2000184B pa 0x80006000 perm 0x4B
print_pgtbl: OK
ugetpid_test starting
usertrap(): unexpected scause 0xd pid=3
            sepc=0x79e stval=0x3fffffd000

```

- For every page table entry in the print_pgtbl output, explain what it logically contains and what its permission bits are.

![[Pasted image 20261002173241.png]]



| VA           | PTE          | PPN       | PA           | perm   | Decoded flags                            | Logical contents                                                                                                       |
| ------------ | ------------ | --------- | ------------ | ------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `0x0`        | `0x21FCF45B` | `0x87F3D` | `0x87F3D000` | `0x5B` | `V=1, R=1, W=0, X=1, U=1, G=0, A=1, D=0` | First page of user text/code. Readable, executable, user‑accessible, not writable.                                     |
| `0x1000`     | `0x21FCE85B` | `0x87F3A` | `0x87F3A000` | `0x5B` | `V=1, R=1, W=0, X=1, U=1, G=0, A=1, D=0` | Second page of user text/code. Same permissions as above.                                                              |
| `0xFFFFD000` | `0x0`        | `0x0`     | `0x0`        | `0x0`  | all zero → invalid                       | Unmapped guard page. No valid mapping; any access traps.                                                               |
| `0xFFFFE000` | `0x21FD80C7` | `0x87F60` | `0x87F60000` | `0xC7` | `V=1, R=1, W=1, X=0, U=0, G=0, A=1, D=1` | Trapframe page. Supervisor‑readable/writable, not executable, not user‑accessible. Holds saved user registers on trap. |
| `0xFFFFF000` | `0x20001C4B` | `0x80007` | `0x80007000` | `0x4B` | `V=1, R=1, W=0, X=1, U=0, G=0, A=1, D=0` | Trampoline code page. Supervisor‑readable/executable, not writable, not user‑accessible. Used for trap entry/exit.     |
![[Pasted image 20261002173545.png]]


## speed up a system call


**Step 1 加物理字段— `kernel/proc.h:102`**:`struct proc` 

```c
struct usyscall *usyscall;   // read-only page shared with user space, holds pid
```

**Step 2 分配页 —  `kernel/proc.c` `allocproc()`**(trapframe 分配之后):

```c
// Allocate a read-only page shared with user space that
// holds the process's pid, so that ugetpid() doesn't
// need to trap into the kernel.
if((p->usyscall = (struct usyscall *)kalloc()) == 0){
  freeproc(p);
  release(&p->lock);
  return 0;
}
p->usyscall->pid = p->pid;
```

**Step 3 建立映射— `kernel/proc.c` `proc_pagetable()`**(trapframe 映射之后):

```c
// map the usyscall page just below the trapframe page,
// read-only for user space.
if(mappages(pagetable, USYSCALL, PGSIZE,
            (uint64)(p->usyscall), PTE_R | PTE_U) < 0){
  uvmunmap(pagetable, TRAMPOLINE, 1, 0);
  uvmunmap(pagetable, TRAPFRAME, 1, 0);
  uvmfree(pagetable, 0);
  return 0;
}
```

**Step 4释放物理页 撤销映射— `kernel/proc.c` **:

```c
// freeproc():
if(p->usyscall)
  kfree((void*)p->usyscall);
p->usyscall = 0;

// proc_freepagetable():
uvmunmap(pagetable, USYSCALL, 1, 0);   // 加在 TRAPFRAME 的 unmap 之后
```

### 什么系统调用适合共享页加速？
1. 纯读，无副作用——不修改任何状态，用户读多少遍结果一样；
2. 数据是内核能安全暴露的——不涉及其他进程的私有信息，不破坏隔离；
3. 数据要么基本不变，要么内核能在已知的更新点顺手维护——否则维护成本超过省下的trap开销

**uptime()**;每次调用trap进内核，锁 读ticks 把值copy out;

方法：在struct usyscall里加一个ticks,ticks只在时钟中断里+1`kernel/trap.c->clockintr()`

每次tick,顺手更新共享页；
```c
ticks++;
myproc()->usyscall->ticks=ticks;
```


## print a page table



```c
// va_base 是本级第 0 条的 va;条目 i 覆盖 va_base + (i << PXSHIFT(level))
static void
vmprint_level(pagetable_t pagetable, int level, uint64 va_base)
{
  for(int i = 0; i < 512; i++){
    pte_t pte = pagetable[i];
    if((pte & PTE_V) == 0)
      continue;
    uint64 va = va_base + ((uint64)i << PXSHIFT(level));
    for(int d = level; d < 3; d++)      // 缩进数 = 3 - level
      printf(" ..");
    printf("%p: pte %p pa %p\n", (void*)va, (void*)pte, (void*)PTE2PA(pte));
    // 非叶 PTE(R/W/X 全 0)→ 递归进入下一级
    if(level > 0 && (pte & (PTE_R|PTE_W|PTE_X)) == 0){
      vmprint_level((pagetable_t)PTE2PA(pte), level - 1, va);
    }
  }
}

void
vmprint(pagetable_t pagetable)
{
  printf("page table %p\n", pagetable);
  vmprint_level(pagetable, 2, 0);
}
```


仿照 freewalk,每个pagetable 512个条目。


## use superpages

> 更大的页

  ┌──────────┬──────────┬
  │  L2 索引 │  L1 索引 │  L0 索引 │  页内偏移   │
  │  (9 bit) │  (9 bit) │  (9 bit) │  (12 bit)  │
  └──────────┴──────────
     每条 1GB    每条 2MB    每条 4KB


