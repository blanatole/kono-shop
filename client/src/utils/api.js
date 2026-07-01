import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

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
        const { data } = await axios.get(API_URL + url, getAuthConfig())
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}




export const postData = async (url, formData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_URL + url, {
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
    const { data } = await axios.put(`${API_URL}${url}`, updatedData, getAuthConfig())
    return data;
}

export const deleteData = async (url ) => {
    const { data } = await axios.delete(`${API_URL}${url}`, getAuthConfig())
    return data;
}


export const uploadImage = async (url, formData) => {
    const { data } = await axios.post(API_URL + url, formData)
    return data;
}


export const deleteImages = async (url,image ) => {
    const { data } = await axios.delete(`${API_URL}${url}`, {
        ...getAuthConfig(),
        data: image,
    });
    return data;
}
