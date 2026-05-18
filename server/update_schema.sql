-- Settings table for site-wide content
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL UNIQUE,
    `value` TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial settings
INSERT INTO site_settings (`key`, `value`) VALUES 
('contact_email', 'hello@asantey.com'),
('contact_phone', '+1 (234) 567-890'),
('contact_address', '123 Luxury Lane, Fashion District, NY'),
('social_instagram', 'https://instagram.com/asantey'),
('social_facebook', 'https://facebook.com/asantey'),
('social_twitter', 'https://twitter.com/asantey'),
('footer_description', 'Luxury hair and braiding services for the modern woman.');
