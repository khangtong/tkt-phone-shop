import Product from "../models/productModel.js";

// Tạo một sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách sản phẩm
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("variation");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("variation");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const { name, description, image, category } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Cập nhật thông tin sản phẩm
    product.name = name || product.name;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};
// Thêm variation vào sản phẩm
export const addVariationToProduct = async (req, res) => {
  try {
    const { variationId } = req.body;
    const productId = req.params.id; // Lấy từ params thay vì body

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Kiểm tra xem variationId có hợp lệ không
    if (!variationId) {
      return res.status(400).json({ message: "Variation ID is required" });
    }

    // Thêm variation vào danh sách (tránh trùng lặp)
    if (!product.variation.includes(variationId)) {
      product.variation.push(variationId);
      await product.save();
    }

    // Populate để trả về đầy đủ thông tin
    const updatedProduct = await Product.findById(productId).populate(
      "variation"
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { name, category, price, ram, rom, color } = req.query;

    // Build product filter based on product fields (only name).
    const productMatch = {
      name: { $regex: name || "", $options: "i" },
    };

    // Build variation match conditions if provided.
    const variationMatch = {};
    if (ram) variationMatch.ram = Number(ram);
    if (rom) variationMatch.rom = Number(rom);
    if (color) variationMatch.color = color;

    // Build aggregation pipeline.
    const pipeline = [
      { $match: productMatch },
      {
        $lookup: {
          from: "variations", // Collection name for variations.
          localField: "variation",
          foreignField: "_id",
          as: "variation",
        },
      },
    ];

    // If variation filters are specified, filter products whose variations match.
    if (Object.keys(variationMatch).length > 0) {
      pipeline.push({
        $match: {
          variation: { $elemMatch: variationMatch },
        },
      });
    }

    // Lookup category if category query parameter is provided to filter by category name.
    if (category) {
      pipeline.push(
        {
          $lookup: {
            from: "categories", // Collection name for categories.
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $match: {
            "category.name": category,
          },
        }
      );
    }

    // Calculate the minimum variation price for each product.
    pipeline.push({
      $addFields: {
        minPrice: { $min: "$variation.price" },
      },
    });

    // If a price sort is provided in the query, sort by minPrice.
    if (price && (price === "asc" || price === "desc")) {
      pipeline.push({
        $sort: { minPrice: price === "asc" ? 1 : -1 },
      });
    }

    const products = await Product.aggregate(pipeline);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
