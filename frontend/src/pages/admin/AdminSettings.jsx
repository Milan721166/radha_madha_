import React, { useState, useEffect } from 'react';
import { Settings, Save, Layout, Megaphone, ShoppingBag, Truck, MessageSquare, CreditCard, Share2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUploader from '../../components/ImageUploader';

export default function AdminSettings() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('announcement');
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    // General Business
    store_name: 'Radhamav Fashions',
    store_email: 'support@radhamav.com',
    store_phone: '+91 6296740204, 7477438769',
    store_address: 'Sahoo House, 6FFX+RP6, Makrampur - Temathani Rd, Larma, Larma Batitaki, West Bengal 721166',
    gst_number: '',

    // Top Bar
    top_bar_enabled: 'true',
    top_bar_text: 'FESTIVE OFFER: FLAT 20% OFF ON KANJEEVARAM SAREES & BRIDAL COLLECTION | FREE EXPRESS SHIPPING',
    top_bar_bg_color: '#121212',
    top_bar_text_color: '#f3e5ab',

    // Section Titles
    cat_section_tag: 'Curated Collections',
    cat_section_title: 'Explore Couture Categories',
    cat_section_subtitle: 'Discover handcrafted sarees, bridal lehengas, and royal ethnic couture.',

    new_arrivals_tag: 'Fresh Drop',
    new_arrivals_title: 'New Arrivals',

    bestsellers_tag: 'Customer Favorites',
    bestsellers_title: 'Best Sellers',

    reviews_section_tag: 'Real Customer Words',
    reviews_section_title: 'Loved By Women Across India',

    newsletter_section_title: 'Join Radhamav Couture Club',
    newsletter_section_subtitle: 'Subscribe to get exclusive early access to festive drop collections, private sales, and ₹500 off your first order.',

    // Promotional Banner
    promo_banner_enabled: 'true',
    promo_banner_tag: 'Festive Season Offer',
    promo_banner_title: 'Flat 20% OFF On Royal Kanjeevaram Sarees',
    promo_banner_desc: 'Use promo code FESTIVE500 at checkout for instant savings.',
    promo_banner_code: 'FESTIVE500',
    promo_banner_button_text: 'Shop Festive Sarees',
    promo_banner_button_link: '/shop?category=sarees',
    promo_banner_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',

    // Shipping & Payments
    free_shipping_min: '999',
    standard_shipping_charge: '99',
    cod_enabled: 'true',

    // Footer & Social
    footer_bio: 'Radhamav Fashions is a premier single-vendor Indian ethnic couture store. Celebrating centuries of handloom silk weaving, royal zari motifs, and modern bridal fashion.',
    social_instagram: 'https://instagram.com',
    social_facebook: 'https://facebook.com',
    social_youtube: 'https://youtube.com',

    value_prop_1_title: 'Free Express Shipping',
    value_prop_1_desc: 'On all orders above ₹999 across India',
    value_prop_2_title: '7-Day Easy Returns',
    value_prop_2_desc: 'Hassle-free exchange & refund',
    value_prop_3_title: '100% Handloom Silk',
    value_prop_3_desc: 'Certified authentic silk weave',
    value_prop_4_title: '100% Secure Payment',
    value_prop_4_desc: 'Encrypted UPI, Cards & NetBanking'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/cms/settings');
      if (res.success && Object.keys(res.settings).length) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/settings', settings);
      if (res.success) {
        showToast('All section settings saved & updated on live store!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'announcement', label: 'Top Announcement Bar', icon: Megaphone },
    { id: 'homepage', label: 'Homepage Sections', icon: Layout },
    { id: 'promo', label: 'Promotional Banner', icon: ShoppingBag },
    { id: 'general', label: 'Store & Contact Info', icon: Settings },
    { id: 'footer', label: 'Footer & Value Props', icon: Share2 },
    { id: 'shipping', label: 'Shipping & COD', icon: Truck },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Store & Section Admin Control</h1>
          <p className="text-xs text-neutral-500">Manage announcement bar, homepage headers, promo banners, footer, and store configuration</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase flex items-center gap-2 shadow-md shrink-0"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-maroon text-white shadow-md'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-sm space-y-6">
        
        {/* TAB 1: Announcement Bar */}
        {activeTab === 'announcement' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-brand-maroon" /> Top Announcement / Notice Bar
            </h3>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Show Announcement Bar</h4>
                <p className="text-xs text-neutral-500">Toggle whether the top banner notice is visible at the very top of the navbar.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.top_bar_enabled === 'true'}
                onChange={(e) => setSettings({ ...settings, top_bar_enabled: e.target.checked ? 'true' : 'false' })}
                className="w-5 h-5 accent-brand-maroon rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Announcement Notice Text</label>
              <textarea
                rows="2"
                value={settings.top_bar_text}
                onChange={(e) => setSettings({ ...settings, top_bar_text: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs outline-none focus:border-brand-gold"
                placeholder="Enter notice text..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.top_bar_bg_color || '#121212'}
                    onChange={(e) => setSettings({ ...settings, top_bar_bg_color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={settings.top_bar_bg_color}
                    onChange={(e) => setSettings({ ...settings, top_bar_bg_color: e.target.value })}
                    className="flex-1 bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.top_bar_text_color || '#f3e5ab'}
                    onChange={(e) => setSettings({ ...settings, top_bar_text_color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={settings.top_bar_text_color}
                    onChange={(e) => setSettings({ ...settings, top_bar_text_color: e.target.value })}
                    className="flex-1 bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="block text-xs font-semibold mb-2">Live Bar Preview:</label>
              <div
                style={{ backgroundColor: settings.top_bar_bg_color, color: settings.top_bar_text_color }}
                className="py-2 px-4 rounded-xl text-center text-xs font-semibold uppercase tracking-wider shadow-inner"
              >
                {settings.top_bar_text || 'Announcement text preview...'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Homepage Section Headers */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-lg text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Layout className="w-5 h-5 text-brand-maroon" /> Homepage Section Titles & Taglines
            </h3>

            {/* Curated Categories */}
            <div className="p-4 bg-neutral-50 rounded-2xl space-y-3 border border-neutral-200">
              <h4 className="font-semibold text-xs text-brand-maroon uppercase tracking-wider">1. Categories Grid Section</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Tagline Badge</label>
                  <input type="text" value={settings.cat_section_tag} onChange={e => setSettings({...settings, cat_section_tag: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Section Main Heading</label>
                  <input type="text" value={settings.cat_section_title} onChange={e => setSettings({...settings, cat_section_title: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Subtitle Description</label>
                <input type="text" value={settings.cat_section_subtitle} onChange={e => setSettings({...settings, cat_section_subtitle: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
              </div>
            </div>

            {/* New Arrivals */}
            <div className="p-4 bg-neutral-50 rounded-2xl space-y-3 border border-neutral-200">
              <h4 className="font-semibold text-xs text-brand-maroon uppercase tracking-wider">2. New Arrivals Section</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Tagline Badge</label>
                  <input type="text" value={settings.new_arrivals_tag} onChange={e => setSettings({...settings, new_arrivals_tag: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Section Main Heading</label>
                  <input type="text" value={settings.new_arrivals_title} onChange={e => setSettings({...settings, new_arrivals_title: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </div>
            </div>

            {/* Best Sellers */}
            <div className="p-4 bg-neutral-50 rounded-2xl space-y-3 border border-neutral-200">
              <h4 className="font-semibold text-xs text-brand-maroon uppercase tracking-wider">3. Best Sellers Section</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Tagline Badge</label>
                  <input type="text" value={settings.bestsellers_tag} onChange={e => setSettings({...settings, bestsellers_tag: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Section Main Heading</label>
                  <input type="text" value={settings.bestsellers_title} onChange={e => setSettings({...settings, bestsellers_title: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="p-4 bg-neutral-50 rounded-2xl space-y-3 border border-neutral-200">
              <h4 className="font-semibold text-xs text-brand-maroon uppercase tracking-wider">4. Customer Reviews Section</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Tagline Badge</label>
                  <input type="text" value={settings.reviews_section_tag} onChange={e => setSettings({...settings, reviews_section_tag: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Section Main Heading</label>
                  <input type="text" value={settings.reviews_section_title} onChange={e => setSettings({...settings, reviews_section_title: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="p-4 bg-neutral-50 rounded-2xl space-y-3 border border-neutral-200">
              <h4 className="font-semibold text-xs text-brand-maroon uppercase tracking-wider">5. Newsletter Banner Section</h4>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Headline</label>
                <input type="text" value={settings.newsletter_section_title} onChange={e => setSettings({...settings, newsletter_section_title: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Sub-headline Description</label>
                <input type="text" value={settings.newsletter_section_subtitle} onChange={e => setSettings({...settings, newsletter_section_subtitle: e.target.value})} className="w-full bg-white border rounded-xl p-2.5 text-xs outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Promotional Banner Builder */}
        {activeTab === 'promo' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-900 border-b pb-2 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-maroon" /> Homepage Promotional Offer Banner
            </h3>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Show Promotional Banner</h4>
                <p className="text-xs text-neutral-500">Enable or hide the middle promotional discount section on the homepage.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.promo_banner_enabled === 'true'}
                onChange={(e) => setSettings({ ...settings, promo_banner_enabled: e.target.checked ? 'true' : 'false' })}
                className="w-5 h-5 accent-brand-maroon rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Tag Badge Text</label>
                <input type="text" value={settings.promo_banner_tag} onChange={e => setSettings({...settings, promo_banner_tag: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Promo Code Highlight</label>
                <input type="text" value={settings.promo_banner_code} onChange={e => setSettings({...settings, promo_banner_code: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none uppercase font-bold" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Banner Offer Title</label>
              <input type="text" value={settings.promo_banner_title} onChange={e => setSettings({...settings, promo_banner_title: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Offer Description</label>
              <textarea rows="2" value={settings.promo_banner_desc} onChange={e => setSettings({...settings, promo_banner_desc: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Action Button Text</label>
                <input type="text" value={settings.promo_banner_button_text} onChange={e => setSettings({...settings, promo_banner_button_text: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Action Button Link</label>
                <input type="text" value={settings.promo_banner_button_link} onChange={e => setSettings({...settings, promo_banner_button_link: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
            </div>

            <ImageUploader
              label="Promo Banner Side Image (Cloudinary Upload)"
              currentImage={settings.promo_banner_image}
              onUploadSuccess={(url) => setSettings(prev => ({ ...prev, promo_banner_image: url }))}
            />

            <div>
              <label className="block text-xs font-semibold mb-1">Banner Side Image URL (Or enter manual URL)</label>
              <input type="text" value={settings.promo_banner_image} onChange={e => setSettings({...settings, promo_banner_image: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
            </div>
          </div>
        )}

        {/* TAB 4: Store General & Contact Info */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-maroon" /> Store Branding & Contact Concierge
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Store Brand Name</label>
                <input type="text" value={settings.store_name} onChange={e => setSettings({...settings, store_name: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">GSTIN Tax Registration Number</label>
                <input type="text" value={settings.gst_number} onChange={e => setSettings({...settings, gst_number: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none uppercase" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Support Email</label>
                <input type="email" value={settings.store_email} onChange={e => setSettings({...settings, store_email: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Support Phone / WhatsApp</label>
                <input type="text" value={settings.store_phone} onChange={e => setSettings({...settings, store_phone: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Full Showroom Address</label>
              <textarea rows="2" value={settings.store_address} onChange={e => setSettings({...settings, store_address: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
            </div>

            <h4 className="font-semibold text-xs text-brand-maroon uppercase tracking-wider pt-3">Social Media Profile Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Instagram URL</label>
                <input type="text" value={settings.social_instagram} onChange={e => setSettings({...settings, social_instagram: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Facebook URL</label>
                <input type="text" value={settings.social_facebook} onChange={e => setSettings({...settings, social_facebook: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">YouTube URL</label>
                <input type="text" value={settings.social_youtube} onChange={e => setSettings({...settings, social_youtube: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Footer & Value Props */}
        {activeTab === 'footer' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-brand-maroon" /> Footer Bio & Value Propositions
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">Footer Brand Bio Description</label>
              <textarea rows="3" value={settings.footer_bio} onChange={e => setSettings({...settings, footer_bio: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
            </div>

            <h4 className="font-semibold text-xs text-brand-maroon uppercase tracking-wider pt-2">4 Store Value Proposition Badges</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <span className="text-[11px] font-bold text-neutral-500">Value Prop #1</span>
                <input type="text" value={settings.value_prop_1_title} onChange={e => setSettings({...settings, value_prop_1_title: e.target.value})} className="w-full bg-white border rounded-xl p-2 text-xs font-semibold" placeholder="Title" />
                <input type="text" value={settings.value_prop_1_desc} onChange={e => setSettings({...settings, value_prop_1_desc: e.target.value})} className="w-full bg-white border rounded-xl p-2 text-xs" placeholder="Description" />
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <span className="text-[11px] font-bold text-neutral-500">Value Prop #2</span>
                <input type="text" value={settings.value_prop_2_title} onChange={e => setSettings({...settings, value_prop_2_title: e.target.value})} className="w-full bg-white border rounded-xl p-2 text-xs font-semibold" placeholder="Title" />
                <input type="text" value={settings.value_prop_2_desc} onChange={e => setSettings({...settings, value_prop_2_desc: e.target.value})} className="w-full bg-white border rounded-xl p-2 text-xs" placeholder="Description" />
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <span className="text-[11px] font-bold text-neutral-500">Value Prop #3</span>
                <input type="text" value={settings.value_prop_3_title} onChange={e => setSettings({...settings, value_prop_3_title: e.target.value})} className="w-full bg-white border rounded-xl p-2 text-xs font-semibold" placeholder="Title" />
                <input type="text" value={settings.value_prop_3_desc} onChange={e => setSettings({...settings, value_prop_3_desc: e.target.value})} className="w-full bg-white border rounded-xl p-2 text-xs" placeholder="Description" />
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <span className="text-[11px] font-bold text-neutral-500">Value Prop #4</span>
                <input type="text" value={settings.value_prop_4_title} onChange={e => setSettings({...settings, value_prop_4_title: e.target.value})} className="w-full bg-white border rounded-xl p-2 text-xs font-semibold" placeholder="Title" />
                <input type="text" value={settings.value_prop_4_desc} onChange={e => setSettings({...settings, value_prop_4_desc: e.target.value})} className="w-full bg-white border rounded-xl p-2 text-xs" placeholder="Description" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Shipping & Payments */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-maroon" /> Shipping Rules & COD Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Free Shipping Minimum Threshold (₹)</label>
                <input type="number" value={settings.free_shipping_min} onChange={e => setSettings({...settings, free_shipping_min: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Standard Shipping Fee (₹)</label>
                <input type="number" value={settings.standard_shipping_charge} onChange={e => setSettings({...settings, standard_shipping_charge: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Enable Cash on Delivery (COD)</h4>
                <p className="text-xs text-neutral-500">Allow customers to pay via Cash on Delivery during checkout.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.cod_enabled === 'true'}
                onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked ? 'true' : 'false' })}
                className="w-5 h-5 accent-brand-maroon rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="maroon-btn px-8 py-3.5 rounded-full text-xs font-semibold uppercase flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Admin Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
