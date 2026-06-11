package com.sky.mapper;

import com.sky.entity.SetmealDish;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;


public interface SetmealDishMapper {

    Integer countByDishId(List<Long> dishIds);

    /**
     * 批量插入套餐关联的擦次品列表
     * @param setmealDishes
     */
    void insertBatch(List<SetmealDish> setmealDishes);
}
