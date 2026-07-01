import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from "react-router-dom";

import { MyContext } from "../../App";

const HomeCat = (props) => {

    const context = useContext(MyContext);

    return (
        <section className="homeCat pb-2">
            <div className="container">
                <div className="sectionTitleRow">
                    <div>
                        <span className="sectionEyebrow">Danh muc noi bat</span>
                        <h3 className="mb-0 hd">Featured Categories</h3>
                    </div>
                </div>
                <Swiper
                    slidesPerView={6}
                    spaceBetween={8}
                    navigation={context.windowWidth > 992}
                    slidesPerGroup={3}
                    modules={[Navigation]}
                    loop={false}
                    className="mySwiper"
                    breakpoints={{
                        320: {
                            slidesPerView: 2.2,
                            spaceBetween: 10,
                        },
                        576: {
                            slidesPerView: 3,
                            spaceBetween: 10,
                        },
                        768: {
                            slidesPerView: 4,
                            spaceBetween: 10,
                        },
                        1100: {
                            slidesPerView: 6,
                            spaceBetween: 10,
                        }
                    }}
                >
                    {
                        props.catData?.length !== 0 && props.catData?.map((cat, index) => (
                            <SwiperSlide key={index}>
                                <Link to={`/products/category/${cat._id}`}>
                                    <div className="item text-center cursor">
                                        <div className="catImage">
                                            <img src={cat.images?.[0]} alt={`${cat.name} category`} />
                                        </div>
                                        <h6>{cat.name}</h6>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>

            </div>
        </section>
    )
}

export default HomeCat;
