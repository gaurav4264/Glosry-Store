import React, { useState, useEffect } from 'react'
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddProduct = () => {

    const [files, setFiles] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [shopId, setShopId] = useState('');
    const [manufacturingDate, setManufacturingDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [stockQuantity, setStockQuantity] = useState(100);
    const [shops, setShops] = useState([]);

    const { axios, fetchProducts } = useAppContext()

    useEffect(() => {
        fetchShops();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchShops = async () => {
        try {
            const { data } = await axios.get('/api/shop/all');
            if (data.success) {
                setShops(data.shops);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            const productData = {
                name,
                description: description.split('\n'),
                category,
                price,
                offerPrice,
                stockQuantity: Number(stockQuantity) || 100,
                shopId: shopId || null,
                manufacturingDate: manufacturingDate || null,
                expiryDate: expiryDate || null
            }

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i])
            }

            const { data } = await axios.post('/api/product/add', formData)

            if (data.success) {
                toast.success(data.message);
                fetchProducts();
                setName('');
                setDescription('')
                setCategory('')
                setPrice('')
                setOfferPrice('')
                setShopId('')
                setManufacturingDate('')
                setExpiryDate('')
                setStockQuantity(100)
                setFiles([])
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
                <div>
                    <p className="text-base font-medium">Product Image</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array(4).fill('').map((_, index) => (
                            <label key={index} htmlFor={`image${index}`}>

                                <input onChange={(e) => {
                                    const updatedFiles = [...files];
                                    updatedFiles[index] = e.target.files[0]
                                    setFiles(updatedFiles)
                                }}
                                    type="file" id={`image${index}`} hidden />

                                <img className="max-w-24 cursor-pointer" src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area} alt="uploadArea" width={100} height={100} />
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
                    <input onChange={(e) => setName(e.target.value)} value={name}
                        id="product-name" type="text" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
                    <textarea onChange={(e) => setDescription(e.target.value)} value={description}
                        id="product-description" rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here"></textarea>
                </div>
                <div className="w-full flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="category">Category</label>
                    <select onChange={(e) => setCategory(e.target.value)} value={category}
                        id="category" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40">
                        <option value="">Select Category</option>
                        {categories.map((item, index) => (
                            <option key={index} value={item.path}>{item.path}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="shop">Select Shop (Optional)</label>
                    <select onChange={(e) => setShopId(e.target.value)} value={shopId}
                        id="shop" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40">
                        <option value="">No Shop Selected</option>
                        {shops.map((shop) => (
                            <option key={shop._id} value={shop._id}>{shop.name} - {shop.address}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="price">Price</label>
                        <input onChange={(e) => setPrice(e.target.value)} value={price}
                            id="price" type="number" placeholder="25" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
                        <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice}
                            id="offer-price" type="number" placeholder="20" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="stock-quantity">
                            Stock Quantity
                            <span className="ml-1 text-xs text-gray-400">(units available)</span>
                        </label>
                        <input
                            onChange={(e) => setStockQuantity(e.target.value)}
                            value={stockQuantity}
                            id="stock-quantity"
                            type="number"
                            min="0"
                            placeholder="100"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-32"
                            required
                        />
                    </div>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="mfg-date">Mfg Date</label>
                        <input onChange={(e) => setManufacturingDate(e.target.value)} value={manufacturingDate}
                            id="mfg-date" type="date" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="expiry-date">Expiry Date</label>
                        <input onChange={(e) => setExpiryDate(e.target.value)} value={expiryDate}
                            id="expiry-date" type="date" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" />
                    </div>
                </div>
                <button type="submit" className="bg-primary text-white py-2.5 px-8 rounded-md w-28">Add</button>
            </form>
        </div>
    )
}

export default AddProduct
