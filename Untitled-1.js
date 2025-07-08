// 一个奇怪的正则表达式校验出错
const reg = /^1\d{10}$/g; // 一个校验手机号的正则表达式

function onInput(e) {
  /*
    这个函数写法会产生一个校验错误，就是首次校验通过，第二次输入符合条件的值时校验失败，
    原因是正则表达式的lastIndex属性的问题，使用同一个正则表达式对象，lastIndex会记录上一次校验的位置，所以需要在每次校验前重置lastIndex属性
  */ 
  const value = e.target.value;
  if(reg.test(value)) { // 
    console.log('校验通过');
  }else {
    console.log('校验失败');
  }
  console.log(reg.lastIndex);
}

/**
 * 响应数据流获取方法
*/
async function getResponse(params, url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  const textDecoder = new TextDecoder();
  const reader = res.body.getReader();
  while(true) {
    const { done, value } = await reader.read();
    if(done) {
      break;
    }
    const text = textDecoder.decode(value);
    console.log(text);
  }
}

// 函数重载

// jQuery写法有瑕疵：根据函数的入参个数来定位使用那个方法，如果形参有默认值的话，fn.length 会排挤默认形参，另外一个问题就是不能确认入参的类型
// 改方法巧妙：利用链式记录上一个add方法进来的方法
function addMethod(object, name, fn) {
  const old = object[name];
  object[name] = function (...args) {
    if(args.length === fn.length) {
      return fn.apply(this, args);
    }else if(typeof old === 'function'){
      return old.apply(this, args)
    }
  }
}
// 使用
const searcher = {};
addMethod(searcher, 'getUsers', () => { // fn1
  console.log('无参');
})
addMethod(searcher, 'getUsers', (name) => {  // fn2
  console.log('根据名称查询');
})
addMethod(searcher, 'getUsers', (name,age) => { // fn3
  console.log('根据名称+年龄查询');
})
searcher.getUsers();
/*   执行过程
 // 函数形成执行链  进入倒数add进去的第3个object[name]方法
function(...args) {
  if(args.length === 2) {
    return fn3.apply(this, args);
  }else if(typeof old === 'function'){
    return old.apply(this, args)
  }
}
// 参数length无法对应，进入倒数add进去的第二个object[name]方法
function(...args) {
  if(args.length === 1) {
    return fn2.apply(this, args);
  }else if(typeof old === 'function'){
    return old.apply(this, args)
  }
}
// 参数length无法对应，进入倒数add进去的第一个object[name]方法
function(...args) {
  if(args.length === 1) { // 对应上了 执行函数
    return fn2.apply(this, args);
  }else if(typeof old === 'function'){
    return old.apply(this, args)
  }
}
*/

const  searchPage = (page, size = 10) => {
  console.log('按照页码搜索');
}

function getUsers(...args) {
  if(args.length === 0) {
    console.log('查询所有用户')
  }
}

const getUsers = createOverload();

getUsers.addImpl('number', searchPage);
getUsers.addImpl('number', 'number', searchPage);
getUsers.addImpl('string', (name = 'ppp') => {
  console.log('按照姓名查询用户');
})
getUsers.addImpl('string', 'string', (name, sex) => {
  console.log('按照姓名，性别来查询用户')
});
getUsers('ppp', '男');

// 创建函数重载的方法
function createOverload() {
  const callMap = new Map();
  function overload(...args) {
    const key = args.map(arg => typeof arg).join(',');
    const fn = callMap.get(key);
    if(fn) {
      fn.apply(this, args)
    }
    throw new Error('缺少方法入参');
  }
  overload.addImpl  = function(...args) {
    const fn = args.pop();
    if(typeof fn !== 'function') {
      return;
    }
    const types = args;
    callMap.set(types.join(','), fn);
  }
  return overload;
}

