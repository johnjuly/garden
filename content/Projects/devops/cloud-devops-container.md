---
created: '2026-01-06'
---


- container 就像是单片机烧写的程序。操作系统也带上了。
- so 一个微服务架构，有成百上千的容器，他们 hosting a small part of  a larger application. container orchestration tools:Kubernetes来管理这些容器
- 容器与虚拟机的区别
-

| 名字         | container                                                                                                                                                | vm                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| os         | - Containers use the host OS, meaning all containers must be compatible with that OS.                                                                    | VMs are effectively separate computers that run their own OS.                                                                               |
| 所使用的资源     | - Containers are lightweight, taking only the resources needed to run the application and the container manager.                                         | - VMs emulate a full computer, meaning that they replicate much of the host environment. That uses more memory, CPU cycles, and disk space. |
| 镜像文件       | - Container images are relatively small in size, making them easy to share.                                                                              | - VM images are often much larger as they include a full OS.                                                                                |
| 隔离的程度与其他同伴 | - Containers might be isolated only very lightly from each other. A process in one container could access memory used by another container, for example. | - By running a separate OS, VMs running on the same hardware are more isolated from one another than containers.                            |
| 集成工具       | - Tools such as Kubernetes make it relatively easy to run multiple containers together, specifying how and when containers interact.                     | - Configuration management tools, such as Terraform or Ansible, automate VM deployment and integration.                                     |
| 生命         | - Containers are ephemeral, meaning they stay alive only for as long as the larger system needs them. Storage is usually handled outside the container.  | - VMs tend to have longer lives and include a full file system of their own.                                                                |
