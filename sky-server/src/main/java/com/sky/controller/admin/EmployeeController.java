package com.sky.controller.admin;

import com.sky.constant.JwtClaimsConstant;
import com.sky.dto.EmployeeDTO;
import com.sky.dto.EmployeeLoginDTO;
import com.sky.dto.EmployeePageQueryDTO;
import com.sky.entity.Employee;
import com.sky.properties.JwtProperties;
import com.sky.result.PageResult;
import com.sky.result.Result;
import com.sky.service.EmployeeService;
import com.sky.utils.JwtUtil;
import com.sky.vo.EmployeeLoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 员工管理
 */
@Api(tags = "员工相关接口")
@RestController
@RequestMapping("/admin/employee")
@Slf4j
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;
    @Autowired
    private JwtProperties jwtProperties;

    /**
     * 登录
     *
     * @param employeeLoginDTO
     * @return
     */
    @ApiOperation("员工登录")
    @PostMapping("/login")
    public Result<EmployeeLoginVO> login(@RequestBody EmployeeLoginDTO employeeLoginDTO) {
        log.info("员工登录：{}", employeeLoginDTO);

        Employee employee = employeeService.login(employeeLoginDTO);

        //登录成功后，生成jwt令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.EMP_ID, employee.getId());
        String token = JwtUtil.createJWT(
                jwtProperties.getAdminSecretKey(),
                jwtProperties.getAdminTtl(),
                claims);

        EmployeeLoginVO employeeLoginVO = EmployeeLoginVO.builder()
                .id(employee.getId())
                .userName(employee.getUsername())
                .name(employee.getName())
                .token(token)
                .build();

        return Result.success(employeeLoginVO);
    }

    /**
     * 退出
     *
     * @return
     */
    @ApiOperation("员工退出")
    @PostMapping("/logout")
    public Result<String> logout() {
        return Result.success();
    }

    /**
     * 新增员工
     *
     * @param dto
     * @return
     */
    @ApiOperation("新增员工")
    @PostMapping
    public Result addEmp(@RequestBody EmployeeDTO dto) {
        log.info("EmployeeController:线程id={}", Thread.currentThread().getId());
        log.info("新增员工，{}", dto);
        //1.调用Service层处理数据
        employeeService.addEmp(dto);
        //2.返回结果
        return Result.success();
    }

    /**
     * 员工分页查询
     *
     * @param dto
     * @return
     */
    @ApiOperation("员工分页查询")
    @GetMapping("/page")
    public Result<PageResult> page(EmployeePageQueryDTO dto) {
        log.info("员工分页查询：{}", dto);
        PageResult pageResult = employeeService.page(dto);
        return Result.success(pageResult);
    }

    /**
     * 启用/禁用员工
     * @param status
     * @param id
     * @return
     */
    //为什么有的不用泛型？（比如 logout、addEmp、enableDisable）
    //这些方法有一个共同特点：前端只需要知道“成功了没有”，不需要后端给它具体的对象数据。
    @ApiOperation("启用/禁用员工")
    @PostMapping("/status/{status}")
    //`@PathVariable` 的作用是把 URL 路径中的占位符值绑定到方法参数上。
    //这里的路由是 `/status/{status}`，花括号 `{status}` 是路径变量占位符。
    // 如果不加 `@PathVariable`，
    // Spring 不知道要把 URL 里的那段路径值注入到 `Integer status` 这个参数里，
    // 方法拿到的就会是 `null`。
    //加了之后，请求 `/status/1` 时，`1` 就会被自动提取并赋值给 `status` 参数。
    public Result enableDisable(@PathVariable Integer status, Long id) {
        log.info("员工状态修改：{},id={}", status, id);
        employeeService.enableDisable(status,id);
        return Result.success();
    }

    /**
     *回显员工
     * @param id
     * @return
     */
    @ApiOperation("回显员工")
    @GetMapping("/{id}")
    //`@PathVariable` 的作用是把 URL 路径中的占位符值绑定到方法参数上。
    public Result<Employee> getByID(@PathVariable Long id){
        log.info("回显员工：id = {}",id);
        Employee employee = employeeService.getByID(id);
        return Result.success(employee);
    }

    /**
     * 编辑员工
     * @return
     */
    @ApiOperation("编辑员工")
    @PutMapping
    public Result update(@RequestBody EmployeeDTO dto){
        log.info("编辑员工:{}",dto);
        employeeService.update(dto);
        return Result.success();
    }

}
