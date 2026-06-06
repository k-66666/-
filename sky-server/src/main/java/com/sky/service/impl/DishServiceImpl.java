package com.sky.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.sky.constant.MessageConstant;
import com.sky.constant.StatusConstant;
import com.sky.dto.DishDTO;
import com.sky.dto.DishPageQueryDTO;
import com.sky.entity.Dish;
import com.sky.entity.DishFlavor;
import com.sky.exception.DeletionNotAllowedException;
import com.sky.mapper.DishFlavorMapper;
import com.sky.mapper.DishMapper;
import com.sky.mapper.SetmealDishMapper;
import com.sky.result.PageResult;
import com.sky.service.DishService;
import com.sky.vo.DishVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.datatransfer.FlavorEvent;
import java.awt.event.WindowFocusListener;
import java.util.List;


@Slf4j
@Service
public class DishServiceImpl implements DishService {

    @Autowired
    private DishMapper dishMapper;
    @Autowired
    private DishFlavorMapper dishFlavorMapper;
    @Autowired
    private SetmealDishMapper setmealDishMapper;

    @Transactional //0.设计多张表的增删改查，要开启事务
    public void addDish(DishDTO dto) {
        //1.构造菜品基本信息数据，将其存入dish表中
        Dish dish = new Dish();
        //拷贝属性值
        BeanUtils.copyProperties(dto, dish);
        //调用Mapper保存方法
        dishMapper.insert(dish);
        log.info("dishid={}", dish.getId());

        //2.构造菜品口味列表数据，将其存入dish_flavor表中
        List<DishFlavor> dishFlavorsList = dto.getFlavors();
        //2.1关联菜品id
        dishFlavorsList.forEach(flavor -> {
            flavor.setDishId(dish.getId());
        });

        //2.2调用mapper保存方法
        dishFlavorMapper.insertBatch(dishFlavorsList);//批量插入口味列表数据
    }


    @Override
    public PageResult page(DishPageQueryDTO dto) {
        //1.设置分页参数
        PageHelper.startPage(dto.getPage(), dto.getPageSize());

        //2.调用mapper的列表查询方法，强转Page
        Page<DishVO> page = dishMapper.list(dto);
        //3.封装PageResult对象并返回

        return new PageResult(page.getTotal(), page.getResult());
    }

    @Transactional // 删两个表，加上事务，保证一致性
    @Override
    public void delete(List<Long> ids) {
        //1.删除菜品之前，先看菜品是否启售，起售中的不允许删除
        ids.forEach(id -> {
            Dish dish = dishMapper.selectById(id);
            if (dish.getStatus() == StatusConstant.ENABLE) {
                throw new DeletionNotAllowedException(MessageConstant.DISH_ON_SALE);
            }
        });
        //2.判断菜品是否被套餐关联，关联了也不允许删除
        Integer count = setmealDishMapper.countByDishId(ids);
        if (count > 0) {
            throw new DeletionNotAllowedException(MessageConstant.DISH_BE_RELATED_BY_SETMEAL);
        }
        //3.删除菜品基本信息dish表
        dishMapper.deleteBatch(ids);

        //4.删除菜品口味列表信息dish_flavio表
        dishFlavorMapper.deleteBatch(ids);

    }

    //查询不需要加事务
    @Override
    public DishVO getById(Long id) {
        DishVO dishVO = new DishVO();
        //1.根据菜品id查询菜品基本信息,封装到dishvo中
        Dish dish = dishMapper.selectById(id);
        BeanUtils.copyProperties(dish, dishVO);
        //2.根据菜品id查询口味基本信息，封装到dishvo中
        List<DishFlavor> flavors = dishFlavorMapper.selectById(id);
        dishVO.setFlavors(flavors);
        //3.构造DishVO对象并返回
        return dishVO;

    }
}
