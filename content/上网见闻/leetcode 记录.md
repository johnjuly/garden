

| 题目序号 | 名字                          | 记录                                                    |     |
| ---- | --------------------------- | ----------------------------------------------------- | --- |
|      | 4 sum[[leetcode 记录#^leetc]] | bug1:超出内存限制 每有去除重复元素与优化 整数溢出问题 int + int long long 存储 |     |
|      |                             |                                                       |     |

##  4 sum ^leetc

```c++
class Solution {

public:

vector<vector<int>> fourSum(vector<int>& nums, int target) {

  

int m=0,n=0;

long long s1=0,s2=0,t1=0;

ranges::sort(nums);

vector<vector<int>> ans;

for (int i =0;i<nums.size()-3;i++){

for(int j =i+1;j<nums.size()-2;j++){

m=j+1,n=nums.size()-1;

s1=nums[i]+nums[j];

t1=target-s1;

while(m<n){

s2=nums[m]+nums[n];

if(s2==t1){

ans.push_back({nums[i],nums[j],nums[m],nums[n]});

}

else if(s2>t1){

n--;

}

else{

m++;

}

}

}

  
  

}

return ans;

//优化？

}

};
```


1. **重复解未处理**：代码在找到一组解后，直接添加结果，但没有跳过重复元素。排序后数组中的重复元素会导致相同的四元组被多次添加到`ans`中，使得结果集过大，占用大量内存。
    
2. **指针移动逻辑不完整**：在找到解后，仅移动指针而未跳过重复值，导致重复解被记录。
3. 移动指针 跳过重复值
4. 1. **跳过重复元素**：
    
    - 外层循环`i`跳过重复值。
        
    - 内层循环`j`跳过重复值。
        
    - 双指针`m`和`n`在找到解后，跳过所有重复值。
        
5. **优化计算**：使用`long long`防止整数溢出（已部分实现，但需完善）。