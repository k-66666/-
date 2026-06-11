package com.sky.service;

import com.sky.dto.SetmealDTO;
import com.sky.dto.SetmealPageQueryDTO;
import com.sky.result.PageResult;

public interface SetMealService {
    /**
     * 分页查询
     * @param dto
     * @return
     */
    PageResult pageQuery(SetmealPageQueryDTO dto);

    /**
     * 新增套餐
     * @param dto
     */
    void addSetMeal(SetmealDTO dto);

    /**
     * 启用/禁用套餐
     * @param status
     * @param id
     */
    void enableDisable(Integer status, Long id);

}
