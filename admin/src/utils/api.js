import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            'Authorization': `Bearer ${token || ""}`,
            'Content-Type': 'application/json',
        },
    };
};

export const fetchDataFromApi = async (url) => {
    try {
        const { data } = await axios.get(BASE_URL + url, getAuthConfig())
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}


export const uploadImage = async (url, formData) => {
    const { data } = await axios.post(BASE_URL + url, formData)
    return data;
}

export const postData = async (url, formData) => {

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(BASE_URL + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token || ""}`,
                'Content-Type': 'application/json',
              },
           
            body: JSON.stringify(formData)
        });


      

        if (response.ok) {
            const data = await response.json();
            //console.log(data)
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
    }


}


export const editData = async (url, updatedData ) => {
    const { data } = await axios.put(`${BASE_URL}${url}`, updatedData, getAuthConfig())
    return data;
}

export const deleteData = async (url ) => {
    const { data } = await axios.delete(`${BASE_URL}${url}`, getAuthConfig())
    return data;
}


export const deleteImages = async (url,image ) => {
    const { data } = await axios.delete(`${BASE_URL}${url}`, {
        ...getAuthConfig(),
        data: image,
    });
    return data;
}
