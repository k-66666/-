package com.sky.controller.admin;
import com.sky.dto.SetmealDTO;
import com.sky.dto.SetmealPageQueryDTO;
import com.sky.mapper.SetmealMapper;
import com.sky.result.PageResult;
import com.sky.result.Result;
import com.sky.service.SetMealService;
import com.sky.vo.SetmealVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags  = "套餐相关接口")
@RestController
//@RestController 是 Spring MVC 框架中用于定义 Web 接口的顶级注解，
// 你可以把它理解为“接口的身份证”。它的作用是告诉 Spring：
// “这个类里写的所有方法，都是为了处理 HTTP 请求并直接返回数据给前端的。”
//它是 @Controller 和 @ResponseBody 两个注解的“组合体”。
// 在传统的 Spring 开发中，@Controller 主要配合视图解析器返回 HTML 页面，
// 而 @ResponseBody 则负责把 Java 对象（如 XXXDTO）自动转化成 JSON 格式的数据。
// 由于现在大部分项目都是前后端分离，后端不再需要处理页面渲染，只需要通过 API 吐出 JSON 数据，
// 因此 @RestController 应运而生。
//使用这个注解后，你类中定义的所有请求处理方法（比如你之前看到的 update 方法），
// 默认都会自动将返回值（Result.success()）转换成 JSON 字符串发送给前端。
// 这极大地简化了代码，让你不需要在每一个方法上都重复标注 @ResponseBody，
// 从而保持代码的整洁与专注。
@RequestMapping("/admin/setmeal")
//定义了该类中所有接口的公共路径前缀
@Slf4j
//用于打印日志
public class SetMealController {
    @Autowired
     private SetMealService setMealService ;
//加上了 @Autowired 注解之后，你就把创建对象的控制权完全交给了 Spring 的 IoC 容器。
// Spring 系统在启动的时候，会自动去扫描项目中带有 @Service、@Component 等注解的类，
// 并把它们初始化成一个个的“Bean”放入自己的管理池中。
// 当它发现你的 Controller 里面声明了 private SetMealService setMealService
// 并且上面带有 @Autowired 注解时，
// Spring 就会自动去自己的池子里寻找一个类型匹配的 SetMealService 实现类对象，
// 然后自动赋值给这个变量。

    /**
     * 套餐分页查询
     * @param dto
     * @return
     */
    @ApiOperation("套餐分页查询")
    @GetMapping("/page")
    public Result<PageResult> page(SetmealPageQueryDTO dto){
        log.info("套餐分页查询：{}",dto);
        PageResult pageResult = setMealService.pageQuery(dto);
        //如果在 Controller 里把 DTO 拆开，
        // 把 page、pageSize、name 等属性一个个拿出来作为独立的参数传递给 Service 方法，
        // 方法签名会变得极其冗长且难以维护，这就完全违背了面向对象的封装思想。
        return Result.success(pageResult);
    }

    /**
     * 新增套餐
     * @param dto
     * @return
     */
    @ApiOperation("新增套餐")
    @PostMapping
    public Result addSetMeal(@RequestBody SetmealDTO dto){
        log.info("新增套餐:{}",dto);
        setMealService.addSetMeal(dto);
        return Result.success();
    }


    /**
     * 启用/禁用套餐
     * @param status
     * @param id
     * @return
     */
    @ApiOperation("启用/禁用套餐")
    @PostMapping("/status/{status}")
    public Result enableDisable(@PathVariable Integer status,Long id){
        log.info("套餐状态查询:{},id = {}",status,id);
        setMealService.enableDisable(status,id);
        return Result.success();
    }


}
