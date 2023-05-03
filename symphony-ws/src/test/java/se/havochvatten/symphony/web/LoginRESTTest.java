package se.havochvatten.symphony.web;

import io.restassured.response.Response;
import org.junit.Test;
import se.havochvatten.symphony.dto.UserDto;
import se.havochvatten.symphony.dto.UserLoginDto;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.hamcrest.MatcherAssert.assertThat;

public class LoginRESTTest extends RESTTest {
    @Test
    public void login() {
        String uid = getUsername();
        String pwd = getPassword();
        UserLoginDto userLogin = new UserLoginDto();
        userLogin.setUsername(uid);
        userLogin.setPassword(pwd);

        Response response = given().
                when().
                header("Content-Type", "application/json").
                body(userLogin).
                post(endpoint("/login"));
        assertThat(response.getStatusCode(), is(200));
        assertEquals(uid, response.as(UserDto.class).username);
    }

    @Test
    public void loginFail() {
        String uid = getUsername();
        String pwd = getPassword() + "X";
        UserLoginDto userLogin = new UserLoginDto();
        userLogin.setUsername(uid);
        userLogin.setPassword(pwd);

        Response response = given().
                when().
                header("Content-Type", "application/json").
                body(userLogin).
                post(endpoint("/login"));
        assertThat(response.getStatusCode(), is(401));
    }

    @Test
    public void logout() {
        String uid = getUsername();
        String pwd = getPassword();
        UserLoginDto userLogin = new UserLoginDto();
        userLogin.setUsername(uid);
        userLogin.setPassword(pwd);

        Response response = given().
                when().
                header("Content-Type", "application/json").
                body(userLogin).
                post(endpoint("/login"));
        assertThat(response.getStatusCode(), is(200));

        response = given().
                when().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                header("Content-Type", "application/json").
                post(endpoint("/logout"));
        assertThat(response.getStatusCode(), is(200));
    }
}
