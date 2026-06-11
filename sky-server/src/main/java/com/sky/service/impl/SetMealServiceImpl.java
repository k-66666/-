package com.sky.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.sky.dto.SetmealDTO;
import com.sky.dto.SetmealPageQueryDTO;
import com.sky.entity.Employee;
import com.sky.entity.Setmeal;
import com.sky.entity.SetmealDish;
import com.sky.mapper.SetmealDishMapper;
import com.sky.mapper.SetmealMapper;
import com.sky.result.PageResult;
import com.sky.service.SetMealService;
import com.sky.vo.SetmealVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class SetMealServiceImpl implements SetMealService {
    @Autowired
    private SetmealMapper setmealMapper;
    @Autowired
    private SetmealDishMapper setmealDishMapper;

    /**
     * 套餐分页查询
     * @param dto
     * @return
     */
    @Override
    public PageResult pageQuery(SetmealPageQueryDTO dto) {
        //1.设置分页参数
        PageHelper.startPage(dto.getPage(),dto.getPageSize());
        //2.调用mapper的列表查询方法，强转page为对象，用vo封装数据，vo合适
        Page<SetmealVO> page = setmealMapper.pageQuery(dto);
        //Page 是 PageHelper 分页插件专属的“内部临时运载车”，
        // 它负责从数据库底层把总条数（total）和查出来的各种业务数据（VO 列表）一口气拉回到你的 Service 层。
        // 但是，纵览Page类的源码，就会发现这辆运载车上不仅有业务数据，
        // 还有 startRow、endRow、reasonable、boundSqlInterceptor 等一大堆前端根本不需要的参数
        // 如果我们偷懒直接把这个臃肿的 Page 对象通过接口扔给前端，
        // 不仅生成的 JSON 会极其庞杂浪费网络带宽，还会严重暴露后端的技术栈细节，
        //因此，我们需要在 Service 层进行一次“卸货和重新打包”的过程，
        // 这就轮到 PageResult 闪亮登场了。
        // PageResult 是我们为了完全迎合前端接口文档而专门定制的“标准展示盒”。
        // 我们在代码里要做的事情，仅仅是提取 Page 这辆临时运载车里的 total 属性，
        // 赋值给 PageResult 的 total；
        // 接着把 Page 内部装满 VO 对象的列表本身，塞进 PageResult 的 records 抽屉里。
        // 完成赋值后，那辆带有无数框架冗余属性的 Page 运载车就会在内存中被当作垃圾回收掉，
        // 而干净、纯粹、完美契合接口文档的 PageResult 则会被交给外层的 Result 返回给前端
        //3.封装pageresult并返回
        return new PageResult(page.getTotal(),page.getResult());
    }

    /**
     * 新增套餐
     * @param dto
     */
    @Override
    @Transactional
    public void addSetMeal(SetmealDTO dto) {
        //1.1.拆分dto，把dto里面的基本信息拷贝到setmeal实体中，把setmealdishes这个数组单独拿出来
        Setmeal setmeal = new Setmeal();
        BeanUtils.copyProperties(dto,setmeal);

        //1.2.将刚刚保存的套餐数据插入进数据库，
        // 调用setMealMapple.insert(setmeal),拿到返回的套餐id，因为插入进去，套餐id会自增
        setmealMapper.insert(setmeal);

        //2.1用遍历数组方式，
        //因为dto传进来的是setmealDishes数组
        //先拿一个列表去接受数组，不然很麻烦
        List<SetmealDish> setmealDishes = dto.getSetmealDishes();
        //再循环遍历我们刚刚创建的列表，把列表中的每个对象通过套餐id关联起来
        setmealDishes.forEach(setmealDish -> {
            setmealDish.setSetmealId(setmeal.getId());
        });
        //当你对一个列表（比如 setmealDishes）使用 forEach 进行循环遍历时，
        // 你遍历的单位是“列表里的每一个元素”，
        // 即每一个 对象，而不是对象内部的每一个属性。
        //2.2批量插入列表数据（菜品数据）,此时已经完成了套餐和菜品的关联
        //插入的时候只关联就行，创造出来让他用的时候相等的条件
        setmealDishMapper.insertBatch(setmealDishes);

    }


    /**
     * 启用/禁用套餐
     * @param status
     * @param id
     */
    @Override
    public void enableDisable(Integer status, Long id) {
        Setmeal setmeal = Setmeal.builder()
                .id(id)
                .status(status)
                .build();
        setmealMapper.update(setmeal);
    }
}
