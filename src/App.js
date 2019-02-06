import * as React from 'react';
import axios, {AxiosInstance, AxiosResponse} from 'axios';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

const styles = theme => ({
    card: {
      margin: 48,
      padding: 10,
      height: 420
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      input: {
        margin: theme.spacing.unit,
    },
});


class App extends React.Component {


    constructor(props){
        super(props);

        this.state = {
            isLogin:false,
            departmentList : [],
            user:null,
        };
    }

    componentDidMount() {
        this.httpClient = axios.create({
            baseURL:'https://kadou.i.nijibox.net/api',
            withCredentials:true,
        });


        this.loadAuth()
            .then(()=>{
                if(! this.state.isLogin){
                    return Promise.resolve();
                }
                return this.loadDepartments();
            })
            .catch((err)=>{
                alert("APIがエラーを返しました\n\n" + err);
            })

        ;
    }

    loadAuth(){
        return this.httpClient.get('/auth' , {params:{callback:'http://localhost:3000'}})
            .then(this.commonResponseHandling)
            .then((result)=>{
                if(result.is_login){
                    this.setState({isLogin:true});
                }else if(result.auth_url){
                    window.location.href = result.auth_url;
                }
            });
    }
    loadDepartments(){
        return this.httpClient.get('/who/departments')
            .then(this.commonResponseHandling)
            .then((result)=>{
                this.setState({departmentList : result});
            })
    }
    ClickDp(e){
        const target=e.target;
        const id= target.getAttribute("data-id");
        console.log(id);
        return this.httpClient.get('/who/search/',{params:{department_id:id}})
            .then(this.commonResponseHandling)
            .then((result)=>{
                this.setState({departmentList : result.item_list});
                console.log(result);
            })
    }
    loadUser(){
        return this.httpClient.get('/who/user/3')
            .then(this.commonResponseHandling)
            .then((result)=>{
                this.setState({user : result});
            })
    }
    loadloginUser(){
        return this.httpClient.get('/profile/get')
            .then(this.commonResponseHandling)
            .then((result)=>{
                this.setState({user : result});
            })
    }

    commonResponseHandling(res:AxiosResponse){
        console.debug(res);
        if(res.data.code !== "200"){
            console.error(res.data.data);
            return Promise.reject("API Error:" + res.data.data.message);
        }
        return Promise.resolve(res.data.data);
    }

    clickHandler = ()=>{
        this.loadUser()
            .catch((err)=>{
                alert('エラー発生');
            });
    };
    clickHandler2 = ()=>{
        this.loadloginUser()
            .catch((err)=>{
                alert('エラー発生');
            });
    };
    

    render() {
        const classes = this.props.classes;

        return (
            <div>

                { this.state.isLogin ?
                    <div>
                        <Button variant="raised" color="primary" onClick={this.clickHandler2}>ログインユーザーの情報</Button>
                        <div>
                            <p><button onClick={e => this.ClickDp(e)} data-id="1">MP事業部</button></p>
                            <p><button onClick={e => this.ClickDp(e)} data-id="2">OS事業部</button></p>
                            <p><button onClick={e => this.ClickDp(e)} data-id="3">UI/UX制作室</button></p>
                            <p><button onClick={e => this.ClickDp(e)} data-id="4">開発</button></p>
                            <p><button onClick={e => this.ClickDp(e)} data-id="5">クリエイティブ</button></p>
                            <p><button onClick={e => this.ClickDp(e)} data-id="6">QAグループ</button></p>
                            <p><button onClick={e => this.ClickDp(e)} data-id="7">経営企画</button></p>
                            <p><button onClick={e => this.ClickDp(e)} data-id="8">ニジボックス</button></p>
                        </div>

                        { this.state.user &&
                        <Card className={classes.card}>
                            { this.state.user.user_code } { this.state.user.user_name }<br />{ this.state.user.description }
                            <img src={this.state.user.main_photo_url} /><br />
                            <h3>{ this.state.user.department_name } </h3>
                        </Card>
                        }

                        <ul>
                            {this.state.departmentList.map((row,index)=>{
                                return <li key={index}>{row.department_name} {row.user_name}</li>;
                            })}
                        </ul>
                    </div>
                    :
                    <p>未ログイン</p>
                }


            </div>
        );
    }
}

export default withStyles(styles)(App);
