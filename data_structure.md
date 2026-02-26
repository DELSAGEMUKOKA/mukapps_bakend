
--
-- Database: `mukaijyl_inventory_db1`
--

-- --------------------------------------------------------

--
-- Table structure for table `adminActions`
--

CREATE TABLE `adminActions` (
  `id` varchar(255) NOT NULL,
  `adminId` text DEFAULT NULL,
  `adminEmail` text DEFAULT NULL,
  `action` text DEFAULT NULL,
  `targetUserId` text DEFAULT NULL,
  `targetUserEmail` text DEFAULT NULL,
  `timestamp` text DEFAULT NULL,
  `success` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `color` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` varchar(255) NOT NULL,
  `name` text DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `ownerId` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','supervisor','operator','cashier') NOT NULL DEFAULT 'cashier',
  `company_id` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `failed_login_attempts` int(11) DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email_per_company` (`email`, `company_id`),
  KEY `email` (`email`),
  KEY `company_id` (`company_id`),
  KEY `role` (`role`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------
--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(255) NOT NULL,
  `name` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `type` text DEFAULT NULL,
  `taxId` text DEFAULT NULL,
  `creditLimit` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `discountPercentage` text DEFAULT NULL,
  `isVip` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `totalPurchases` text DEFAULT NULL,
  `totalSpent` text DEFAULT NULL,
  `loyaltyPoints` text DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `lastPurchaseDate` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` varchar(255) NOT NULL,
  `status` text DEFAULT NULL,
  `amount` text DEFAULT NULL,
  `title` text DEFAULT NULL,
  `category` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `userId` text DEFAULT NULL,
  `paymentMethod` text DEFAULT NULL,
  `date` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `receiptUrl` text DEFAULT NULL,
  `approvedBy` text DEFAULT NULL,
  `approvedAt` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(255) NOT NULL,
  `invoiceNumber` text DEFAULT NULL,
  `customerId` text DEFAULT NULL,
  `customerName` text DEFAULT NULL,
  `items` text DEFAULT NULL,
  `subtotal` text DEFAULT NULL,
  `tax` text DEFAULT NULL,
  `discount` text DEFAULT NULL,
  `discountPercentage` text DEFAULT NULL,
  `total` text DEFAULT NULL,
  `paymentMethod` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `deliveryAddress` text DEFAULT NULL,
  `date` text DEFAULT NULL,
  `userId` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `companyInfo` text DEFAULT NULL,
  `paymentDate` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loginAttempts`
--

CREATE TABLE `loginAttempts` (
  `id` varchar(255) NOT NULL,
  `userId` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `ipAddress` text DEFAULT NULL,
  `userAgent` text DEFAULT NULL,
  `success` text DEFAULT NULL,
  `timestamp` text DEFAULT NULL,
  `captchaVerified` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` text DEFAULT NULL,
  `barcode` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `categoryId` text DEFAULT NULL,
  `price` text DEFAULT NULL,
  `costPrice` text DEFAULT NULL,
  `minStockLevel` text DEFAULT NULL,
  `unit` text DEFAULT NULL,
  `category` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `currentStock` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `productType` text DEFAULT NULL,
  `trackStock` text DEFAULT NULL,
  `allowVariablePrice` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(255) NOT NULL,
  `name` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `permissions` text DEFAULT NULL,
  `isDefault` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` varchar(255) NOT NULL,
  `currency` text DEFAULT NULL,
  `dateFormat` text DEFAULT NULL,
  `invoicePrefix` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `country` text DEFAULT NULL,
  `website` text DEFAULT NULL,
  `city` text DEFAULT NULL,
  `postalCode` text DEFAULT NULL,
  `impotNumber` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `invoiceFooter` text DEFAULT NULL,
  `slogan` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `companyName` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `rccm` text DEFAULT NULL,
  `idNat` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `taxId` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockMovements`
--

CREATE TABLE `stockMovements` (
  `id` varchar(255) NOT NULL,
  `productId` text DEFAULT NULL,
  `type` text DEFAULT NULL,
  `quantity` text DEFAULT NULL,
  `previousStock` text DEFAULT NULL,
  `currentStock` text DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `reference` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `date` text DEFAULT NULL,
  `userId` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` varchar(255) NOT NULL,
  `userId` text DEFAULT NULL,
  `plan` text DEFAULT NULL,
  `isSubscribed` text DEFAULT NULL,
  `currentPeriodStart` text DEFAULT NULL,
  `paymentHistory` text DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `currentPeriodEnd` text DEFAULT NULL,
  `trialEndsAt` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `maxicashReference` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userPins`
--

CREATE TABLE `userPins` (
  `id` varchar(255) NOT NULL,
  `pinCode` text DEFAULT NULL,
  `userId` text DEFAULT NULL,
  `companyId` text DEFAULT NULL,
  `createdAt` text DEFAULT NULL,
  `updatedAt` text DEFAULT NULL,
  `_export_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;