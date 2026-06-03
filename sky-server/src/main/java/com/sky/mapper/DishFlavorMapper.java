package com.sky.mapper;

import com.sky.entity.DishFlavor;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

//@Mapper。启动类加了mapperscan注解，这个可以省略

public interface DishFlavorMapper {
    /**
     * 批量插入口味列表数据
     * @param dishFlavorsList
     */
    void insertBatch(List<DishFlavor> dishFlavorsList);
}
