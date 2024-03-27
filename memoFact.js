function addToCache(){
    let cache = {};
    return function fact(n){
        let ans =1;
        for(let i=1;i<=n;i++){
            ans*=i;
        }
        return ans;
        // if(cache[n-1]){
        //     ans = n*cache[n-1]
        //     cache[n] = ans;
        //     return ans;
        // }
        // else{
        //     for(let i=1;i<=n;i++){
        //         ans*=i;
        //     }
        //     cache[n] = ans;
        //     return ans;
        // }
    }
}   

var myFunc = addToCache();
console.log(myFunc(22))