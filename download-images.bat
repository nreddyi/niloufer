@echo off
rem Downloads the Cafe Niloufer homepage images into the images folder.
rem Double-click this file once (needs internet). Uses curl, built into Windows 10/11.
cd /d "%~dp0"
if not exist images mkdir images

curl -L -s -S -o "images\logo.png" "https://cafeniloufer.com/cdn/shop/files/logo_360x_3a3f6a04-b109-4e88-97f9-b49ac4675c0d.png?width=360"
echo saved images\logo.png
curl -L -s -S -o "images\combo-supreme.png" "https://cafeniloufer.com/cdn/shop/files/Combo3_supreme.png?width=900"
echo saved images\combo-supreme.png
curl -L -s -S -o "images\combo-platinum.png" "https://cafeniloufer.com/cdn/shop/files/Combo2_Final.png?width=900"
echo saved images\combo-platinum.png
curl -L -s -S -o "images\combo-osmania-tea.png" "https://cafeniloufer.com/cdn/shop/files/Combo1_option1.png?width=900"
echo saved images\combo-osmania-tea.png
curl -L -s -S -o "images\tea-platinum.webp" "https://cafeniloufer.com/cdn/shop/files/Niloufer_Platinum_Tea_Powder.webp?width=900"
echo saved images\tea-platinum.webp
curl -L -s -S -o "images\tea-double-delight.webp" "https://cafeniloufer.com/cdn/shop/files/Niloufer_Double_Delight_Tea_Powder.webp?width=900"
echo saved images\tea-double-delight.webp
curl -L -s -S -o "images\tea-supreme.webp" "https://cafeniloufer.com/cdn/shop/files/Niloufer_Supreme_Tea_Powder_front.webp?width=900"
echo saved images\tea-supreme.webp
curl -L -s -S -o "images\osmania-biscuits.webp" "https://cafeniloufer.com/cdn/shop/files/p0qzdfdmgume7hkc4ddv.webp?width=900"
echo saved images\osmania-biscuits.webp
curl -L -s -S -o "images\dry-fruit-biscuits.webp" "https://cafeniloufer.com/cdn/shop/files/DryFruitBiscuits.webp?width=900"
echo saved images\dry-fruit-biscuits.webp
curl -L -s -S -o "images\story-1.png" "https://cafeniloufer.com/cdn/shop/files/Frame_15.png?width=900"
echo saved images\story-1.png
curl -L -s -S -o "images\story-2.png" "https://cafeniloufer.com/cdn/shop/files/Frame_14.png?width=900"
echo saved images\story-2.png
curl -L -s -S -o "images\story-3.png" "https://cafeniloufer.com/cdn/shop/files/Frame_16.png?width=900"
echo saved images\story-3.png
curl -L -s -S -o "images\gift-delights.webp" "https://cafeniloufer.com/cdn/shop/files/DelightsBox_Hires_800x_1d683445-12c7-41b7-adcd-f24d6c4b3e09.webp?width=900"
echo saved images\gift-delights.webp
curl -L -s -S -o "images\gift-premium-cookies.webp" "https://cafeniloufer.com/cdn/shop/files/premco2.webp?width=900"
echo saved images\gift-premium-cookies.webp
curl -L -s -S -o "images\gift-signature.webp" "https://cafeniloufer.com/cdn/shop/files/SignatureBox_Hires_800x_bc8c926b-0362-4656-8bd1-b0b54046f249.webp?width=900"
echo saved images\gift-signature.webp
curl -L -s -S -o "images\gift-moments.webp" "https://cafeniloufer.com/cdn/shop/files/moments1.webp?width=900"
echo saved images\gift-moments.webp
curl -L -s -S -o "images\gift-hamper.webp" "https://cafeniloufer.com/cdn/shop/files/hamper1.webp?width=900"
echo saved images\gift-hamper.webp
curl -L -s -S -o "images\gift-mini-combo.webp" "https://cafeniloufer.com/cdn/shop/files/minic1.webp?width=900"
echo saved images\gift-mini-combo.webp
curl -L -s -S -o "images\gift-flip.webp" "https://cafeniloufer.com/cdn/shop/files/flip1.webp?width=900"
echo saved images\gift-flip.webp
curl -L -s -S -o "images\payment.jpg" "https://cafeniloufer.com/cdn/shop/files/payment.jpg?width=462"
echo saved images\payment.jpg
curl -L -s -S -o "images\banner-tea.png" "https://cafeniloufer.com/cdn/shop/files/NC_Web_1920x800_final.png?width=1920"
echo saved images\banner-tea.png
curl -L -s -S -o "images\banner-biscuits.jpg" "https://cafeniloufer.com/cdn/shop/files/CF_Niloufer_fruit_biscuit_web_banner_301025.jpg?width=1920"
echo saved images\banner-biscuits.jpg
curl -L -s -S -o "images\banner-gifts.webp" "https://cafeniloufer.com/cdn/shop/files/GIFT_BOX.webp?width=1920"
echo saved images\banner-gifts.webp
curl -L -s -S -o "images\banner-tearoom.webp" "https://cafeniloufer.com/cdn/shop/files/TEA_ROOMS_BANNER.webp?width=1920"
echo saved images\banner-tearoom.webp
curl -L -s -S -o "images\banner-order.webp" "https://cafeniloufer.com/cdn/shop/files/ONLINE_ORDER.webp?width=1920"
echo saved images\banner-order.webp

echo.
echo Done. Open index.html.
pause
