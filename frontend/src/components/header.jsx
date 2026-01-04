import Logo from '../../public/yato_node.svg'
const Header = () => {
    return (
        <div className='flex items-center justify-between p-4 bg-[#282828] text-white'>
            <img src={Logo} alt="" className='w-40'/>
        </div>
    )
}
export default Header