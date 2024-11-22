import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { MyContext } from "../../App";

const HomeBanner = ({ data = [] }) => {
    const context = useContext(MyContext);

    const extendedData = [...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data];

    return (
        <div className="container mt-3">
            <div className="homeBannerSection">
                <Swiper
                    slidesPerView={1.2}
                    spaceBetween={15}
                    navigation={context.windowWidth>992 ? true : false}
                    centeredSlides={true}
                    loop={true}
                    speed={5000}
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                    }}
                    modules={[Navigation, Autoplay]}
                    className="mySwiper"
                >
                    {
                        data?.length > 0 && data?.map((item, index) => {
                            return (
                                <SwiperSlide key={index}>
                                    <div className="item">
                                        <img src={item?.images[0]} className="w-100" />
                                    </div>
                                </SwiperSlide>
                            )
                        })
                    }


                </Swiper>
            </div>
        </div>
    );
};

HomeBanner.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            images: PropTypes.arrayOf(PropTypes.string),
        })
    ),
};

export default HomeBanner;


/*import React from "react";
import PropTypes from "prop-types";
import "./HomeBanner.css";

const HomeBanner = ({ data = [] }) => {
    // Nhân đôi dữ liệu để các slide có thể cuộn liên tục
    const extendedData = [...data, ...data];

    return (
        <div className="container mt-3">
            <div className="homeBannerSection">
                <div className="slider">
                    <div className="slider-track">
                        {extendedData.map((item, index) => (
                            <div className="slide" key={index}>
                                <img src={item?.images[0]} className="w-100" alt={`Slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

HomeBanner.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            images: PropTypes.arrayOf(PropTypes.string),
        })
    ),
};

export default HomeBanner;*/
