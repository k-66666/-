package com.sky.controller.admin;

import com.sky.dto.DishDTO;
import com.sky.dto.DishPageQueryDTO;
import com.sky.result.PageResult;
import com.sky.result.Result;
import com.sky.service.DishService;
import com.sky.vo.DishVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/dish")
@Slf4j
@Api(tags = "菜品相关接口")
public class DishController {
    @Autowired
    private DishService dishService;


    /**
     * 新增菜品
     * @param dto
     * @return
     */
    @ApiOperation("新增菜品")
    @PostMapping
    public Result addDish(@RequestBody DishDTO dto){
        log.info("新增菜品:{}",dto);
        dishService.addDish(dto);
        return Result.success();
        }

    /**
     * 菜品分页查询
     * @param dto
     * @return
     */
    @ApiOperation("分页查询菜品列表")
    @GetMapping("/page")
    public Result<PageResult> page(DishPageQueryDTO dto){ //请求参数不是json
        log.info("菜品分页查询：{}",dto);
        PageResult pageResult = dishService.page(dto);
        return Result.success(pageResult);
    }

    /**
     * 删除菜品
     * @param ids
     * @return
     */
    @ApiOperation("删除菜品")
    @DeleteMapping
   public Result delete(@RequestParam List<Long> ids){ //用于将 URL 请求参数（如 ?ids=1,2,3）绑定到该 List 集合中
        log.info("删除菜品：{}",ids);
        dishService.delete(ids);
        return Result.success();
   }

   @ApiOperation("根据id查询菜品")
   @GetMapping("/{id}")
   public Result getById(@PathVariable Long id ){
        log.info("回显菜品：",id);
       DishVO dishVO =  dishService.getById(id);

        return  Result.success(dishVO);
   }
}
