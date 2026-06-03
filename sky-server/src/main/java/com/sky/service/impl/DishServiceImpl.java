package com.sky.service.impl;

import com.sky.dto.DishDTO;
import com.sky.entity.Dish;
import com.sky.entity.DishFlavor;
import com.sky.mapper.DishFlavorMapper;
import com.sky.mapper.DishMapper;
import com.sky.service.DishService;
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
    private DishMapper dishmapper;
    @Autowired
    private DishFlavorMapper dishFlavorMapper;

    @Transactional //0.设计多张表的增删改查，要开启事务
    public void addDish(DishDTO dto) {
        //1.构造菜品基本信息数据，将其存入dish表中
        Dish dish = new Dish();
        //拷贝属性值
        BeanUtils.copyProperties(dto,dish);
        //调用Mapper保存方法
        dishmapper.insert(dish);
        log.info("dishid={}",dish.getId());

        //2.构造菜品口味列表数据，将其存入dish_flavor表中
        List<DishFlavor> dishFlavorsList = dto.getFlavors();
        //2.1关联菜品id
        dishFlavorsList.forEach(flavor ->{
            flavor.setDishId(dish.getId());
        });

        //2.2调用mapper保存方法
        dishFlavorMapper.insertBatch(dishFlavorsList);//批量插入口味列表数据
    }}
