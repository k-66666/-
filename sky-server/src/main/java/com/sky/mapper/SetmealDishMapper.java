package com.sky.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;


public interface SetmealDishMapper {

    Integer countByDishId(List<Long> dishIds);
}
