import basicSsl from '@vitejs/plugin-basic-ssl'

/** @type {import('vite').UserConfig} */
export default {
    plugins: [
        basicSsl({
            /** name of certification */
            name: 'test',
            /** custom trust domains */
            domains: ['*.rogama25.es'],
            /** custom certification directory */
            certDir: '/Users/.../.devServer/cert'
        })
    ],
    base: "/"
}