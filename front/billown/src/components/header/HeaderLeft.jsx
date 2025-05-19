import logo from "../../assets/billownlogo.png"
const HeaderLeft = ({ toggle, setToggle }) => {
    return (
      <div className="header-left">
        <div className="header-logo">
          <div className="flex items-center space-x-4">
                <img src={logo} alt="Logo billown" className="h-10 w-auto" />
            </div>
        </div>
        <div onClick={() => setToggle((prev) => !prev)} className="header-menu">
          {toggle ? (
            <i className="bi bi-x-lg"></i>
          ) : (
            <i className="bi bi-list"></i>
          )}
        </div>
      </div>
      
    );
  };
  
  export default HeaderLeft;


