

| 题目序号                                                                                                        | 名字                                                                   | 记录                                                                                         |     |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --- |
|                                                                                                             | 4 sum[[leetcode 记录#^leetc]]                                          | bug1:超出内存限制 没有去除重复元素与优化 整数溢出问题 int + int long long 存储                                      |     |
| [[有效三角形]]                                                                                                   | [611. 有效三角形的个数](https://leetcode.cn/problems/valid-triangle-number/) | count的更新                                                                                   |     |
|                                                                                                             | [[接雨水]]                                                              | 向量使用问题                                                                                     |     |
| 125                                                                                                         | [[验证回文串]]                                                            | `isalnum(s[i])` 的意思是：**判断字符串 `s` 中第 `i` 个位置的字符是否是一个字母数字字符（Alphanumeric）。**<br><br>-        |     |
| 2150                                                                                                        | 浇水                                                                   | 当装满水后还要浇水 ，也是要减法的，，，以及当两者相同时的简化成一个If语句1. 循环结束后，如果 i=j 且 max(a,b)<plants[i]，则需要重新灌满水罐，答案加一。 |     |
| 3                                                                                                           | 无重复字符的最长子串                                                           | 哈希 unordered_map                                                                           |     |
| [2958. 最多 K 个重复元素的最长子数组](https://leetcode.cn/problems/length-of-longest-subarray-with-at-most-k-frequency/) |                                                                      | 判断的条件是每次考虑新加入的元素，while循环条件是新加入的元素的频率而不是左边的！！                                               |     |

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




## 关于滑动窗口

跳过了最后一个题 实在是不想看了